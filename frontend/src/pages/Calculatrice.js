import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

/* =============================================
   Donnees partagees
   ============================================= */
const rideStyles = [
  { value: "dh_park", label: "DH Bike Park", sagMin: 30, sagMax: 35 },
  { value: "dh_natural", label: "DH Naturel / World Cup", sagMin: 28, sagMax: 32 },
  { value: "enduro_agg", label: "Enduro agressif", sagMin: 25, sagMax: 30 },
  { value: "enduro_marathon", label: "Enduro marathon", sagMin: 22, sagMax: 27 },
];

const symptomsList = [
  { id: "dur_debut", label: "Trop dur en debut de course", causes: ["Pression air trop elevee", "Stiction joints", "Huile trop visqueuse", "LSC trop eleve"], solutions: ["Reduire pression air", "Lubrifier joints", "Huile moins visqueuse", "Ouvrir LSC"] },
  { id: "bottom_out", label: "Bottom-out (tape en fin de course)", causes: ["HSC trop faible", "Pas assez de tokens", "Pression trop basse", "Spring rate trop bas"], solutions: ["Augmenter HSC", "Ajouter tokens/spacers", "Augmenter pression air", "Ressort plus dur"] },
  { id: "packing", label: "Packing (reste enfoncee)", causes: ["LSR trop lent", "HSR trop lent", "Cavitation", "Huile degradee"], solutions: ["Ouvrir LSR", "Verifier pression azote IFP", "Vidanger huile", "Augmenter pression air"] },
  { id: "kickback", label: "Rebond trop rapide (kick-back)", causes: ["LSR trop rapide", "HSR trop rapide", "Pression air trop elevee"], solutions: ["Fermer LSR", "Ajouter shims detente", "Baisser pression air"] },
  { id: "clunk", label: "Bruit de claquement en compression", causes: ["Cavitation", "Bottom-out mecanique", "Jeu bagues montage", "IFP en butee"], solutions: ["Augmenter pression azote", "Ajouter bottom-out spacer", "Remplacer bagues DU", "Verifier IFP"] },
  { id: "gurgling", label: "Bruit de succion / gurgling", causes: ["Air dans le circuit", "Niveau huile insuffisant", "Joints defectueux"], solutions: ["Purger le circuit", "Completer niveau huile", "Remplacer joints"] },
  { id: "fade", label: "Fade thermique", causes: ["Huile degradee", "Viscosite trop basse a chaud", "Volume huile insuffisant"], solutions: ["Vidanger huile neuve", "Viscosite superieure", "Amortisseur piggyback"] },
  { id: "asymetrique", label: "Comportement asymetrique", causes: ["Shim pliee/fissuree", "Joint partiellement extrude", "Clapet bloque"], solutions: ["Inspecter chaque shim", "Remplacer joints", "Nettoyer valves"] },
  { id: "descend", label: "Descend toute seule au repos", causes: ["Joint tige use", "Cartouche non etanche", "Desequilibre positif/negatif"], solutions: ["Remplacer joints tige", "Verifier etancheite cartouche", "Refaire equalisation"] },
  { id: "pop", label: "Pop au debattement", causes: ["Cavitation IFP", "Pression azote trop basse", "Air piege"], solutions: ["Regonfler azote", "Purger air", "Verifier IFP"] },
];

const shimMFactors = {
  "0.10": 1.0,
  "0.15": 3.37,
  "0.20": 8.0,
  "0.25": 15.6,
  "0.30": 27.0,
};

const SHIM_CURVE_SAMPLE_COUNT = 40;
const SHIM_CURVE_MAX_VELOCITY = 4;

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
const getShimMFactor = (thickness) => shimMFactors[Number(thickness).toFixed(2)] || 1.0;

function interpolateCurveForce(points, targetVelocity) {
  if (!points.length) return 0;
  if (targetVelocity <= points[0].velocity) return points[0].force;

  for (let i = 1; i < points.length; i += 1) {
    const previousPoint = points[i - 1];
    const currentPoint = points[i];

    if (targetVelocity <= currentPoint.velocity) {
      const ratio = (targetVelocity - previousPoint.velocity) / (currentPoint.velocity - previousPoint.velocity || 1);
      return previousPoint.force + (currentPoint.force - previousPoint.force) * ratio;
    }
  }

  return points[points.length - 1].force;
}

function buildShimCurve(shims, pistonDia) {
  if (!Array.isArray(shims) || shims.length === 0 || pistonDia <= 0) {
    return {
      points: [],
      maxVelocity: SHIM_CURVE_MAX_VELOCITY,
      maxForce: 1,
      forceAtPointOne: 0,
    };
  }

  const expandedDiameters = shims.flatMap((shim) =>
    Array.from({ length: Math.max(1, Number(shim.qty) || 1) }, () => Number(shim.diameter) || 0)
  );

  const pistonArea = Math.PI * Math.pow(pistonDia / 2, 2);
  const totalResistance = shims.reduce((sum, shim) => {
    const mFactor = getShimMFactor(shim.thickness);
    return sum + mFactor * Math.pow((Number(shim.diameter) || 0) / pistonDia, 2) * (Number(shim.qty) || 1);
  }, 0);

  const largestDiameter = Math.max(...expandedDiameters);
  const smallestDiameter = Math.min(...expandedDiameters);
  const averageDiameter = expandedDiameters.reduce((sum, diameter) => sum + diameter, 0) / expandedDiameters.length;
  const taperRatio = clampValue((largestDiameter - smallestDiameter) / Math.max(largestDiameter, 1), 0.05, 0.7);
  const supportRatio = clampValue(averageDiameter / pistonDia, 1.0, 1.45);
  const baseForceScale = totalResistance * pistonArea * 0.135;
  const kneeVelocity = clampValue(0.55 + supportRatio * 0.18 - taperRatio * 0.22, 0.45, 1.35);
  const reliefStrength = 0.55 + taperRatio * 0.65;
  const preloadForce = baseForceScale * 0.02;

  const points = Array.from({ length: SHIM_CURVE_SAMPLE_COUNT }, (_, index) => {
    const velocity = (SHIM_CURVE_MAX_VELOCITY / (SHIM_CURVE_SAMPLE_COUNT - 1)) * index;

    if (velocity === 0) {
      return { velocity, force: 0 };
    }

    const lowSpeedForce = baseForceScale * Math.pow(velocity, 0.68);
    const highSpeedSupport = baseForceScale * 0.38 * Math.pow(velocity, 1.15);
    const flexRelief = 1 / (1 + Math.pow(velocity / kneeVelocity, 1.35) * reliefStrength);
    const seatedForce = preloadForce * (1 - Math.exp(-velocity * 5.2));
    const force = seatedForce + lowSpeedForce + highSpeedSupport * flexRelief;

    return { velocity, force };
  });

  const maxForce = Math.max(...points.map((point) => point.force), 1) * 1.12;

  return {
    points,
    maxVelocity: SHIM_CURVE_MAX_VELOCITY,
    maxForce,
    forceAtPointOne: interpolateCurveForce(points, 0.1),
  };
}

/* =============================================
   MODULE 1 : SAG & Pression
   ============================================= */
function ModuleSag({ rider }) {
  const style = rideStyles.find(s => s.value === rider.rideStyle) || rideStyles[0];
  const sagTargetPct = (style.sagMin + style.sagMax) / 2 / 100;
  const sagForkMm = rider.forkTravel * sagTargetPct;
  const sagShockMm = rider.shockStroke * sagTargetPct;

  // Pression air fourche estimee (approximation tables Fox/RS)
  const forkPsi = Math.round(rider.weightKg * 0.9 + 20);
  // Pression air amortisseur : P_init = (m.g.LR.(1-SAG%)) / A_piston / 6894.76
  const shockAirSection = 0.0012; // ~1200mm2 section air typique (dia ~39mm)
  const shockPsi = Math.round((rider.weightKg * 9.81 * rider.leverageRatio * (1 - sagTargetPct)) / shockAirSection / 6894.76);
  // Spring rate coil : SR = (poids * 9.81) / (stroke * SAG%)
  const srNmm = (rider.weightKg * 9.81) / (rider.shockStroke / 1000 * sagTargetPct) / 1000;
  const srLbsIn = srNmm * 5.71;

  return (
    <div data-testid="module-sag">
      <p>
        Calcule le SAG cible, la pression d'air initiale et le spring rate recommande.
        Base sur le poids pilote equipe, le style de ride et les geometries de suspension.
      </p>
      <div className="results-grid">
        <div className="result-card">
          <div className="result-label">SAG cible fourche</div>
          <div className="result-value">{sagForkMm.toFixed(0)}<span className="result-unit">mm</span></div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{style.sagMin}-{style.sagMax}% ({style.label})</div>
        </div>
        <div className="result-card">
          <div className="result-label">SAG cible amortisseur</div>
          <div className="result-value">{sagShockMm.toFixed(1)}<span className="result-unit">mm</span></div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{style.sagMin}-{style.sagMax}%</div>
        </div>
        <div className="result-card">
          <div className="result-label">Pression fourche</div>
          <div className="result-value" data-testid="fork-psi">{forkPsi}<span className="result-unit">psi</span></div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Estimation initiale</div>
        </div>
        <div className="result-card">
          <div className="result-label">Pression amortisseur</div>
          <div className="result-value" data-testid="shock-psi">{shockPsi}<span className="result-unit">psi</span></div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>LR = {rider.leverageRatio}</div>
        </div>
        <div className="result-card">
          <div className="result-label">Spring rate coil</div>
          <div className="result-value" data-testid="spring-rate">{srNmm.toFixed(1)}<span className="result-unit">N/mm</span></div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{srLbsIn.toFixed(0)} lbs/in</div>
        </div>
      </div>
      <div className="formula-block" style={{ marginTop: "20px" }}>
        <div className="formula-name">Formules utilisees</div>
        <div className="formula-desc">
          SAG% cible : {style.sagMin}-{style.sagMax}% ({style.label})<br/>
          Pression fourche : ~poids(kg) x 0.9 + 20 (approximation tables constructeurs)<br/>
          Pression amortisseur : P_init = (m.g.LR.(1-SAG%)) / A_piston / 6894.76 (loi gaz parfait simplifiee)<br/>
          Spring rate coil : SR = (m.g) / (course.SAG%)
        </div>
      </div>
    </div>
  );
}

/* =============================================
   MODULE 2 : Shim Stack
   ============================================= */
function ModuleShimStack() {
  const [pistonDia, setPistonDia] = useState(32);
  const [shims, setShims] = useState([
    { diameter: 40, thickness: 0.15, qty: 1 },
    { diameter: 36, thickness: 0.15, qty: 1 },
    { diameter: 30, thickness: 0.20, qty: 2 },
    { diameter: 25, thickness: 0.25, qty: 1 },
  ]);
  const [newDia, setNewDia] = useState(30);
  const [newThick, setNewThick] = useState(0.15);
  const [newQty, setNewQty] = useState(1);

  const getM = (t) => getShimMFactor(t);
  const calcK = (s) => getM(s.thickness) * Math.pow(s.diameter / pistonDia, 2) * s.qty;
  const totalK = shims.reduce((sum, s) => sum + calcK(s), 0);
  const shimCurve = useMemo(() => buildShimCurve(shims, pistonDia), [shims, pistonDia]);

  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || totalK === 0 || shimCurve.points.length === 0) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cw = 500, ch = 280;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const w = cw - pad.left - pad.right;
    const h = ch - pad.top - pad.bottom;

    ctx.fillStyle = "#12121f";
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = "#2a2a3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + h);
    ctx.lineTo(pad.left + w, pad.top + h);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i += 1) {
      const x = pad.left + (w / 5) * i;
      const y = pad.top + (h / 5) * i;

      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#ff1493";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    shimCurve.points.forEach((point, index) => {
      const x = pad.left + (point.velocity / shimCurve.maxVelocity) * w;
      const y = pad.top + h - (point.force / shimCurve.maxForce) * h;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "rgba(255,20,147,0.8)";
    shimCurve.points.forEach((point) => {
      const x = pad.left + (point.velocity / shimCurve.maxVelocity) * w;
      const y = pad.top + h - (point.force / shimCurve.maxForce) * h;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#a0a0b0";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("V (m/s)", pad.left + w/2, ch - 6);
    for (let i = 0; i <= 5; i++) ctx.fillText((shimCurve.maxVelocity * i / 5).toFixed(1), pad.left + (w/5)*i, pad.top + h + 16);
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) ctx.fillText(Math.round(shimCurve.maxForce * (5-i) / 5), pad.left - 6, pad.top + (h/5)*i + 4);
  }, [totalK, shimCurve]);

  return (
    <div data-testid="module-shimstack">
      <p>Analyse d'un shim stack saisi manuellement. Estimateur simplifie base sur les formules publiques.</p>
      <div className="form-grid" style={{ marginBottom: "16px" }}>
        <div className="form-group">
          <label>Diametre piston (mm)</label>
          <input type="number" value={pistonDia} onChange={e => setPistonDia(Number(e.target.value))} min="15" max="50" data-testid="calc-piston-dia" />
        </div>
      </div>
      <table className="tech-table">
        <thead>
          <tr><th>Dia (mm)</th><th>Ep. (mm)</th><th>Qty</th><th>M</th><th>K</th><th></th></tr>
        </thead>
        <tbody>
          {shims.map((s, i) => (
            <tr key={i}>
              <td>{s.diameter}</td><td>{s.thickness}</td><td>{s.qty}</td>
              <td>{getM(s.thickness).toFixed(1)}</td>
              <td>{calcK(s).toFixed(2)}</td>
              <td><button onClick={() => setShims(p => p.filter((_,j) => j!==i))} style={{ background: "var(--error)", color: "#fff", border: "none", borderRadius: "3px", padding: "2px 6px", cursor: "pointer", fontSize: "11px" }}>X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px", alignItems: "flex-end" }}>
        <div className="form-group" style={{ width: "90px" }}>
          <label>Dia</label>
          <input type="number" value={newDia} onChange={e => setNewDia(Number(e.target.value))} min="8" max="52" />
        </div>
        <div className="form-group" style={{ width: "90px" }}>
          <label>Ep.</label>
          <select value={newThick} onChange={e => setNewThick(Number(e.target.value))}>
            <option value={0.10}>0.10</option><option value={0.15}>0.15</option><option value={0.20}>0.20</option><option value={0.25}>0.25</option><option value={0.30}>0.30</option>
          </select>
        </div>
        <div className="form-group" style={{ width: "70px" }}>
          <label>Qty</label>
          <input type="number" value={newQty} onChange={e => setNewQty(Number(e.target.value))} min="1" max="10" />
        </div>
        <button className="calc-btn" onClick={() => setShims(p => [...p, { diameter: newDia, thickness: newThick, qty: newQty }])} data-testid="calc-add-shim">+ Ajouter</button>
      </div>
      <div className="results-grid" style={{ marginTop: "16px" }}>
        <div className="result-card">
          <div className="result-label">Rigidite totale</div>
          <div className="result-value">{totalK.toFixed(1)}</div>
        </div>
        <div className="result-card">
          <div className="result-label">Force @ 0.1 m/s</div>
          <div className="result-value" data-testid="calc-force-01ms">{Math.round(shimCurve.forceAtPointOne)}<span className="result-unit">N</span></div>
        </div>
      </div>
      <div className="chart-container" style={{ marginTop: "16px" }}>
        <canvas ref={canvasRef} style={{ width: "100%", maxWidth: "500px", height: "280px" }} data-testid="calc-fvv-chart" />
      </div>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }} data-testid="calc-curve-samples">
        Courbe estimative tracee sur {SHIM_CURVE_SAMPLE_COUNT} points entre 0 et {SHIM_CURVE_MAX_VELOCITY} m/s, avec une transition digressive dependante du stack.
      </p>
    </div>
  );
}

/* =============================================
   MODULE 3 : Diagnostic
   ============================================= */
function ModuleDiagnostic() {
  const [checked, setChecked] = useState({});
  const [elementType, setElementType] = useState("fourche");

  const toggleSymptom = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSymptoms = symptomsList.filter(s => checked[s.id]);

  return (
    <div data-testid="module-diagnostic">
      <p>Selection de symptomes + diagnostic interactif. Cochez les symptomes observes.</p>
      <div className="form-group" style={{ marginBottom: "16px", maxWidth: "300px" }}>
        <label>Type d'element</label>
        <select value={elementType} onChange={e => setElementType(e.target.value)} data-testid="diag-element-type">
          <option value="fourche">Fourche</option>
          <option value="amortisseur">Amortisseur</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
        {symptomsList.map(s => (
          <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", padding: "6px 10px", background: checked[s.id] ? "rgba(255,20,147,0.08)" : "transparent", border: `1px solid ${checked[s.id] ? "var(--pink)" : "var(--borders)"}`, borderRadius: "4px" }}>
            <input type="checkbox" checked={!!checked[s.id]} onChange={() => toggleSymptom(s.id)} style={{ accentColor: "var(--pink)" }} data-testid={`diag-check-${s.id}`} />
            {s.label}
          </label>
        ))}
      </div>

      {activeSymptoms.length > 0 && (
        <div>
          <h3 style={{ color: "var(--pink)", marginTop: "0" }}>Diagnostic ({elementType})</h3>
          {activeSymptoms.map(s => (
            <div key={s.id} className="symptom-card" style={{ marginBottom: "16px" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--borders)" }}>
                <h4 style={{ margin: 0, color: "var(--text)" }}>{s.label}</h4>
              </div>
              <div style={{ padding: "14px 18px" }}>
                <p style={{ color: "var(--warning)", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Causes probables :</p>
                <ul style={{ paddingLeft: "18px", marginBottom: "12px" }}>
                  {s.causes.map((c, i) => <li key={i} style={{ fontSize: "13px", marginBottom: "4px" }}>{c}</li>)}
                </ul>
                <p style={{ color: "var(--success)", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Solutions :</p>
                <ul style={{ paddingLeft: "18px" }}>
                  {s.solutions.map((sol, i) => <li key={i} style={{ fontSize: "13px", marginBottom: "4px" }}>{sol}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =============================================
   MODULE 4 : Export Excel
   ============================================= */
function ModuleExport({ rider, shimStack, diagnosticResults }) {
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1 : Donnees pilote
    const riderData = [
      ["Parametre", "Valeur"],
      ["Poids equipe (kg)", rider.weightKg],
      ["Taille (cm)", rider.heightCm],
      ["Style de ride", rideStyles.find(s => s.value === rider.rideStyle)?.label || rider.rideStyle],
      ["Debattement fourche (mm)", rider.forkTravel],
      ["Course amortisseur (mm)", rider.shockStroke],
      ["Entraxe amortisseur (mm)", rider.shockEyeToEye],
      ["Leverage ratio moyen", rider.leverageRatio],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(riderData);
    XLSX.utils.book_append_sheet(wb, ws1, "Donnees pilote");

    // Sheet 2 : Resultats calcul
    const style = rideStyles.find(s => s.value === rider.rideStyle) || rideStyles[0];
    const sagPct = (style.sagMin + style.sagMax) / 2 / 100;
    const forkPsi = Math.round(rider.weightKg * 0.9 + 20);
    const shockAirSection = 0.0012;
    const shockPsi = Math.round((rider.weightKg * 9.81 * rider.leverageRatio * (1 - sagPct)) / shockAirSection / 6894.76);
    const srNmm = (rider.weightKg * 9.81) / (rider.shockStroke / 1000 * sagPct) / 1000;
    const resultsData = [
      ["Parametre", "Valeur", "Unite"],
      ["SAG cible", `${style.sagMin}-${style.sagMax}`, "%"],
      ["SAG fourche", (rider.forkTravel * sagPct).toFixed(0), "mm"],
      ["SAG amortisseur", (rider.shockStroke * sagPct).toFixed(1), "mm"],
      ["Pression fourche recommandee", forkPsi, "psi"],
      ["Pression amortisseur recommandee (init)", shockPsi, "psi"],
      ["Spring rate coil recommande", srNmm.toFixed(1), "N/mm"],
      ["Spring rate coil recommande", (srNmm * 5.71).toFixed(0), "lbs/in"],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(wb, ws2, "Resultats calcul");

    // Sheet 3 : Shim Stack (placeholder)
    const shimData = [
      ["Position", "Diametre (mm)", "Epaisseur (mm)", "Quantite"],
      ["1", "40", "0.15", "1"],
      ["2", "36", "0.15", "1"],
      ["3", "30", "0.20", "2"],
      ["4", "25", "0.25", "1"],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(shimData);
    XLSX.utils.book_append_sheet(wb, ws3, "Shim Stack");

    // Sheet 4 : Diagnostic
    const diagData = [
      ["Symptome", "Causes", "Solutions"],
      ...symptomsList.slice(0, 3).map(s => [s.label, s.causes.join("; "), s.solutions.join("; ")])
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(diagData);
    XLSX.utils.book_append_sheet(wb, ws4, "Diagnostic");

    // Export
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `chatel_suspension_${date}_${rider.weightKg}kg.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div data-testid="module-export">
      <p>
        Exporte toutes les donnees et resultats en fichier .xlsx avec 4 onglets :
        Donnees pilote, Resultats calcul, Shim Stack, Diagnostic.
      </p>
      <div style={{ background: "var(--code-bg)", border: "1px solid var(--borders)", borderRadius: "4px", padding: "16px", marginBottom: "16px" }}>
        <table className="tech-table" style={{ margin: 0 }}>
          <thead>
            <tr><th>Onglet</th><th>Contenu</th></tr>
          </thead>
          <tbody>
            <tr><td>Donnees pilote</td><td>Poids, taille, style, debattements, leverage ratio</td></tr>
            <tr><td>Resultats calcul</td><td>SAG, pressions, spring rate</td></tr>
            <tr><td>Shim Stack</td><td>Tableau du stack saisi</td></tr>
            <tr><td>Diagnostic</td><td>Symptomes, causes, solutions</td></tr>
          </tbody>
        </table>
      </div>
      <button className="calc-btn" onClick={handleExport} data-testid="export-xlsx-btn">
        Telecharger .xlsx
      </button>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
        Format : chatel_suspension_YYYYMMDD_XXkg.xlsx
      </p>
    </div>
  );
}

/* =============================================
   PAGE PRINCIPALE : Calculatrice
   ============================================= */
export default function Calculatrice() {
  const [activeTab, setActiveTab] = useState("sag");

  // Rider inputs
  const [weightKg, setWeightKg] = useState(80);
  const [heightCm, setHeightCm] = useState(178);
  const [rideStyle, setRideStyle] = useState("dh_natural");
  const [forkTravel, setForkTravel] = useState(170);
  const [shockStroke, setShockStroke] = useState(65);
  const [shockEyeToEye, setShockEyeToEye] = useState(230);
  const [leverageRatio, setLeverageRatio] = useState(2.8);

  const rider = { weightKg, heightCm, rideStyle, forkTravel, shockStroke, shockEyeToEye, leverageRatio };

  const tabs = [
    { id: "sag", label: "SAG & Pression" },
    { id: "shimstack", label: "Shim Stack" },
    { id: "diagnostic", label: "Diagnostic" },
    { id: "export", label: "Export Excel" },
  ];

  return (
    <article className="page-content" data-testid="calculatrice-page">
      <h1>Calculatrice suspension</h1>
      <p className="page-subtitle">
        Module interactif : 4 sous-modules de calcul + export Excel
      </p>

      {/* Rider inputs */}
      <div className="calc-section">
        <h3>Donnees pilote (partagees entre tous les modules)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Poids pilote equipe (kg)</label>
            <input type="number" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))} min={40} max={150} data-testid="input-weight" />
          </div>
          <div className="form-group">
            <label>Taille (cm)</label>
            <input type="number" value={heightCm} onChange={e => setHeightCm(Number(e.target.value))} min={140} max={210} data-testid="input-height" />
          </div>
          <div className="form-group">
            <label>Style de ride</label>
            <select value={rideStyle} onChange={e => setRideStyle(e.target.value)} data-testid="select-ride-style">
              {rideStyles.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Debattement fourche (mm)</label>
            <input type="number" value={forkTravel} onChange={e => setForkTravel(Number(e.target.value))} min={100} max={220} data-testid="input-fork-travel" />
          </div>
          <div className="form-group">
            <label>Course amortisseur (mm)</label>
            <input type="number" value={shockStroke} onChange={e => setShockStroke(Number(e.target.value))} min={40} max={80} data-testid="input-shock-stroke" />
          </div>
          <div className="form-group">
            <label>Entraxe amortisseur (mm)</label>
            <input type="number" value={shockEyeToEye} onChange={e => setShockEyeToEye(Number(e.target.value))} min={150} max={280} data-testid="input-eye-to-eye" />
          </div>
          <div className="form-group">
            <label>Leverage ratio moyen</label>
            <input type="number" value={leverageRatio} onChange={e => setLeverageRatio(Number(e.target.value))} min={1.5} max={4.5} step={0.1} data-testid="input-leverage-ratio" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" data-testid="calc-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
            data-testid={`tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "sag" && <ModuleSag rider={rider} />}
        {activeTab === "shimstack" && <ModuleShimStack />}
        {activeTab === "diagnostic" && <ModuleDiagnostic />}
        {activeTab === "export" && <ModuleExport rider={rider} />}
      </div>
    </article>
  );
}
