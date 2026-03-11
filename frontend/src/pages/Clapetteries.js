import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* =============================================
   Shim stack visualisation (barres horizontales)
   ============================================= */
function ShimStackVisual({ shims, pistonDiameter }) {
  if (!shims || shims.length === 0) return null;
  const maxDia = Math.max(pistonDiameter || 0, ...shims.map(s => s.diameter));
  const reversed = [...shims].reverse();
  return (
    <div className="shim-visual" data-testid="shim-stack-visual">
      {/* Clamp washer (haut du stack, le plus loin du piston) */}
      <div className="shim-bar clamp" style={{ width: "20px" }} />
      <div className="shim-label">Clamp</div>
      {/* Shims du backup (haut) vers le face shim (bas, contre le piston) */}
      {reversed.map((s, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div
            className={`shim-bar ${s.type === "crossover" ? "crossover" : ""}`}
            style={{ width: `${(s.diameter / maxDia) * 280}px` }}
            title={`${s.diameter}x${s.thickness} (x${s.qty})`}
          />
          <div className="shim-label">
            {s.diameter}x{s.thickness} {s.qty > 1 ? `x${s.qty}` : ""}
            <span style={{ color: "var(--borders)", marginLeft: "6px", fontSize: "9px" }}>
              [{s.type}]
            </span>
          </div>
        </div>
      ))}
      {/* Piston (bas du stack, les face shims sont plaques dessus) */}
      <div style={{ width: `${(pistonDiameter / maxDia) * 280}px`, height: "10px", background: "#ff1493", borderRadius: "2px", marginTop: "4px" }} />
      <div className="shim-label" style={{ color: "#ff1493" }}>Piston ({pistonDiameter}mm)</div>
    </div>
  );
}

const SHIM_CURVE_SAMPLE_COUNT = 40;
const SHIM_CURVE_MAX_VELOCITY = 1.5;

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

function getInterpolatedMFactor(thickness) {
  const mFactors = { 0.10: 1.0, 0.15: 3.37, 0.20: 8.0, 0.25: 15.6, 0.30: 27.0 };
  const parsedThickness = Number.parseFloat(thickness);

  if (mFactors[parsedThickness]) {
    return mFactors[parsedThickness];
  }

  const keys = Object.keys(mFactors).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (parsedThickness >= keys[i] && parsedThickness <= keys[i + 1]) {
      const ratio = (parsedThickness - keys[i]) / (keys[i + 1] - keys[i]);
      return mFactors[keys[i]] + ratio * (mFactors[keys[i + 1]] - mFactors[keys[i]]);
    }
  }

  return 1.0;
}

function interpolateCurveForce(points, velocityTarget) {
  if (!points.length) return 0;
  if (velocityTarget <= points[0].velocity) return points[0].force;

  for (let index = 1; index < points.length; index += 1) {
    const previousPoint = points[index - 1];
    const currentPoint = points[index];

    if (velocityTarget <= currentPoint.velocity) {
      const ratio = (velocityTarget - previousPoint.velocity) / (currentPoint.velocity - previousPoint.velocity || 1);
      return previousPoint.force + (currentPoint.force - previousPoint.force) * ratio;
    }
  }

  return points[points.length - 1].force;
}

function buildShimCurveData({ shims, pistonDia, numPorts, portDia }) {
  if (!Array.isArray(shims) || shims.length === 0 || pistonDia <= 0 || numPorts <= 0 || portDia <= 0) {
    return {
      points: [],
      maxVelocity: SHIM_CURVE_MAX_VELOCITY,
      maxForce: 1,
      kneeVelocity: 0,
      digressivityIndex: 0,
      sampleCount: SHIM_CURVE_SAMPLE_COUNT,
      markers: {
        lowSpeed: { velocity: 0.1, force: 0 },
        highSpeed: { velocity: 1.0, force: 0 },
      },
    };
  }

  const expandedShims = shims.flatMap((shim, sourceIndex) =>
    Array.from({ length: Math.max(1, Number(shim.qty) || 1) }, (_, qtyIndex) => ({
      ...shim,
      sourceIndex,
      qtyIndex,
    }))
  );

  const pistonArea = Math.PI * Math.pow(pistonDia / 2, 2);
  const portArea = Math.max(numPorts * Math.PI * Math.pow(portDia / 2, 2), 1);
  const stackLength = Math.max(expandedShims.length, 1);
  const diameters = expandedShims.map((shim) => Number(shim.diameter) || 0);
  const thicknesses = expandedShims.map((shim) => Number(shim.thickness) || 0.1);

  let baseResistance = 0;
  let faceResistance = 0;
  let backupResistance = 0;
  let crossoverDepth = 0;
  let orderBiasAccumulator = 0;

  expandedShims.forEach((shim, index) => {
    const diameter = Number(shim.diameter) || 0;
    const normalizedIndex = index / Math.max(stackLength - 1, 1);
    const diameterRatio = clampValue(diameter / pistonDia, 0.45, 1.7);
    const faceWeight = 1.95 - normalizedIndex * 1.35;
    const supportWeight = 0.65 + normalizedIndex * 1.55;
    const typeBias = shim.type === "crossover" ? 0.32 : shim.type === "face" ? 1.1 : shim.type === "backup" ? 0.97 : 1.0;
    const shimBase = getInterpolatedMFactor(shim.thickness) * Math.pow(diameterRatio, 2.2) * typeBias;

    baseResistance += shimBase;
    faceResistance += shimBase * faceWeight;
    backupResistance += shimBase * supportWeight;
    orderBiasAccumulator += shimBase * (0.58 - normalizedIndex * 1.16);

    if (shim.type === "crossover") {
      crossoverDepth += 1 - normalizedIndex * 0.55;
    }
  });

  const stackSpread = clampValue((Math.max(...diameters) - Math.min(...diameters)) / Math.max(Math.max(...diameters), 1), 0.03, 0.8);
  const averageThickness = thicknesses.reduce((sum, thickness) => sum + thickness, 0) / thicknesses.length;
  const faceBackupRatio = faceResistance / Math.max(backupResistance, 1e-6);
  const orderBias = clampValue(orderBiasAccumulator / Math.max(baseResistance, 1e-6), -0.6, 0.6);
  const portRestriction = clampValue((pistonArea / portArea) * 0.09, 0.8, 3.5);
  const baseScale = baseResistance * pistonArea * portRestriction * 0.065;
  const kneeVelocity = clampValue(
    0.24 + faceBackupRatio * 0.18 + stackSpread * 0.34 - crossoverDepth * 0.16 + averageThickness * 2.1 - orderBias * 0.28,
    0.16,
    1.1
  );
  const digressivityIndex = clampValue(0.3 + stackSpread * 0.68 + orderBias * 0.9 - crossoverDepth * 0.22, 0.1, 1.35);
  const progressiveBoost = clampValue(
    0.16 + (backupResistance / Math.max(faceResistance, 1e-6)) * 0.32 + Math.max(-orderBias, 0) * 0.7 + crossoverDepth * 0.06,
    0.08,
    0.9
  );
  const lowSpeedScale = baseScale * (1 + Math.max(orderBias, 0) * 0.9);
  const highSpeedScale = baseScale * (0.18 + progressiveBoost * 0.46);
  const preloadForce = lowSpeedScale * 0.05 * (1 + crossoverDepth * 0.35);
  const lowSpeedExponent = 0.6 + stackSpread * 0.08 + Math.max(orderBias, 0) * 0.05;
  const highSpeedExponent = 1.08 + progressiveBoost * 0.22;
  const reliefExponent = 1.2 + stackSpread * 0.35;

  const points = Array.from({ length: SHIM_CURVE_SAMPLE_COUNT }, (_, index) => {
    const velocity = (SHIM_CURVE_MAX_VELOCITY / (SHIM_CURVE_SAMPLE_COUNT - 1)) * index;

    if (velocity === 0) {
      return { velocity, force: 0 };
    }

    const seatedForce = preloadForce * (1 - Math.exp(-velocity * 8.5));
    const lowSpeedForce = lowSpeedScale * Math.pow(velocity, lowSpeedExponent);
    const reliefFactor = 1 / (1 + Math.pow(velocity / kneeVelocity, reliefExponent) * digressivityIndex);
    const highSpeedForce = highSpeedScale * Math.pow(velocity, highSpeedExponent);

    return {
      velocity,
      force: seatedForce + lowSpeedForce + highSpeedForce * reliefFactor,
    };
  });

  const currentMaxForce = Math.max(...points.map((point) => point.force), 1);
  const comparisonScaleForce = Math.max(1800, pistonArea * portRestriction * 3.4);

  return {
    points,
    maxVelocity: SHIM_CURVE_MAX_VELOCITY,
    maxForce: Math.max(comparisonScaleForce, currentMaxForce * 1.08),
    kneeVelocity,
    digressivityIndex,
    sampleCount: SHIM_CURVE_SAMPLE_COUNT,
    markers: {
      lowSpeed: { velocity: 0.1, force: interpolateCurveForce(points, 0.1) },
      highSpeed: { velocity: 1.0, force: interpolateCurveForce(points, 1.0) },
    },
  };
}

/* =============================================
   Force vs Velocity Canvas (shim stack)
   ============================================= */
function ShimFvVChart({ curveData, width = 600, height = 350 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !curveData?.points?.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 25, right: 25, bottom: 45, left: 55 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    ctx.fillStyle = "#12121f";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "#1f1f30";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top + (h/5)*i);
      ctx.lineTo(pad.left + w, pad.top + (h/5)*i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad.left + (w/5)*i, pad.top);
      ctx.lineTo(pad.left + (w/5)*i, pad.top + h);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#2a2a3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + h);
    ctx.lineTo(pad.left + w, pad.top + h);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#a0a0b0";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("Vitesse de tige (m/s)", pad.left + w/2, height - 6);
    ctx.save();
    ctx.translate(12, pad.top + h/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("Force (N)", 0, 0);
    ctx.restore();

    const { maxVelocity, maxForce, markers, points } = curveData;

    // Ticks
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let i = 0; i <= 5; i++) {
      ctx.fillText((maxVelocity * i / 5).toFixed(1), pad.left + (w/5)*i, pad.top + h + 16);
    }
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      ctx.fillText(Math.round(maxForce * (5-i) / 5), pad.left - 6, pad.top + (h/5)*i + 4);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = pad.left + (point.velocity / maxVelocity) * w;
      const y = pad.top + h - ((point.force / 1.25) / maxForce) * h;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#ff1493";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = pad.left + (point.velocity / maxVelocity) * w;
      const y = pad.top + h - (point.force / maxForce) * h;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "rgba(255,20,147,0.85)";
    points.forEach((point) => {
      const x = pad.left + (point.velocity / maxVelocity) * w;
      const y = pad.top + h - (point.force / maxForce) * h;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    const drawMarker = (marker, color) => {
      const x = pad.left + (marker.velocity / maxVelocity) * w;
      const y = pad.top + h - (marker.force / maxForce) * h;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "#e0e0e0";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${Math.round(marker.force)}N @ ${marker.velocity.toFixed(1)}m/s`, x + 8, y + 3);
    };
    drawMarker(markers.lowSpeed, "#00cc88");
    drawMarker(markers.highSpeed, "#ffaa00");

  }, [curveData, width, height]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: `${width}px`, height: `${height}px` }} data-testid="shim-fvv-chart" />
    </div>
  );
}

/* =============================================
   MAIN PAGE : Clapetteries
   ============================================= */
export default function Clapetteries() {
  // Interactive shim stack state
  const [pistonDia, setPistonDia] = useState(32);
  const [numPorts, setNumPorts] = useState(6);
  const [portDia, setPortDia] = useState(3);
  const [shims, setShims] = useState([
    { diameter: 40, thickness: 0.15, qty: 1, type: "face" },
    { diameter: 38, thickness: 0.15, qty: 1, type: "face" },
    { diameter: 35, thickness: 0.10, qty: 1, type: "mid" },
    { diameter: 30, thickness: 0.15, qty: 2, type: "backup" },
    { diameter: 25, thickness: 0.20, qty: 1, type: "backup" },
  ]);
  const [newDia, setNewDia] = useState(30);
  const [newThick, setNewThick] = useState(0.15);
  const [newQty, setNewQty] = useState(1);
  const [newType, setNewType] = useState("mid");
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  /* ===========================================
     PRESETS : configurations de base
     =========================================== */
  const presets = [
    {
      name: "Stock DH compression (Fox GRIP2)",
      desc: "Stack de compression typique d'une Fox 36/38 GRIP2 de serie. Pyramidal classique, digressif. Bon support pedalage/freinage, confortable sur gros impacts. Point de depart standard pour le DH.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 40, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 38, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 35, thickness: 0.10, qty: 1, type: "mid" },
        { diameter: 30, thickness: 0.15, qty: 2, type: "backup" },
        { diameter: 25, thickness: 0.20, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Stock detente DH",
      desc: "Stack de detente DH standard. Plus souple que la compression — la detente n'est entrainee que par le ressort. Face shims plus fins pour un retour controle sans packing.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 40, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 36, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 32, thickness: 0.10, qty: 1, type: "mid" },
        { diameter: 28, thickness: 0.15, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.15, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Enduro polyvalent compression",
      desc: "Stack compression enduro equilibre. LSC modere (pas trop de resistance au pedalage), HSC suffisant pour les impacts. Bon compromis montee/descente pour l'enduro race.",
      pistonDia: 30, numPorts: 6, portDia: 2.5,
      shims: [
        { diameter: 38, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 35, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 30, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 25, thickness: 0.15, qty: 1, type: "backup" },
        { diameter: 22, thickness: 0.20, qty: 1, type: "backup" },
      ]
    },
    {
      name: "DH Bike Park (souple)",
      desc: "Stack souple pour le bike park : pumptrack, tables, enchainements rapides. Peu de LSC pour maximiser la sensibilite. HSC modere. Pour pilotes qui privilegient le confort et le flow.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 38, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 35, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 30, thickness: 0.10, qty: 1, type: "mid" },
        { diameter: 25, thickness: 0.15, qty: 1, type: "backup" },
      ]
    },
    {
      name: "DH World Cup (raide)",
      desc: "Stack agressif pour la DH naturelle rapide. Fort LSC pour le support au freinage et en virage. HSC eleve pour encaisser les gros impacts sans bottom-out. Reserve aux pilotes experts > 75 kg.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 42, thickness: 0.20, qty: 1, type: "face" },
        { diameter: 40, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 38, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 35, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 30, thickness: 0.20, qty: 2, type: "backup" },
        { diameter: 25, thickness: 0.25, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Lineaire avec crossover",
      desc: "Stack avec crossover gap central pour decouplage LSC/HSC. Le gap (shim 20x0.10) cree une zone de transition douce entre basse et haute vitesse. Profil quasi-lineaire, previsible. Ideal pour le tuning fin.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 40, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 36, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 20, thickness: 0.10, qty: 1, type: "crossover" },
        { diameter: 32, thickness: 0.15, qty: 1, type: "backup" },
        { diameter: 28, thickness: 0.20, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.20, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Tres digressif (plush)",
      desc: "Stack pyramidal prononce : face shims larges et fins, backups petits et raides. Tres confortable sur les petits chocs (haute resistance LSC initiale qui chute vite). Sensation plush. Attention au manque de HSC sur gros impacts.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 44, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 40, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 35, thickness: 0.10, qty: 1, type: "mid" },
        { diameter: 25, thickness: 0.25, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Progressif (anti bottom-out)",
      desc: "Stack plat avec peu de taper : faible resistance a basse vitesse, montee rapide en haute vitesse. Le profil progressif protege en fin de course. Combine avec un spring rate adapte, il previent efficacement le bottom-out.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 34, thickness: 0.20, qty: 1, type: "face" },
        { diameter: 32, thickness: 0.20, qty: 1, type: "mid" },
        { diameter: 30, thickness: 0.20, qty: 1, type: "mid" },
        { diameter: 28, thickness: 0.25, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.25, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Pilote leger (< 65 kg) compression",
      desc: "Stack allege pour pilotes legers. Shims plus fins, moins de backups. Reduit le seuil d'ouverture pour compenser le manque de force. Un pilote leger ne genere pas assez de pression pour ouvrir un stack standard — il faut adapter.",
      pistonDia: 30, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 36, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 32, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 28, thickness: 0.10, qty: 1, type: "mid" },
        { diameter: 25, thickness: 0.15, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Pilote lourd (> 90 kg) compression",
      desc: "Stack renforce pour pilotes lourds. Face shims plus epais + backups supplementaires. Un pilote lourd genere plus de pression sur le piston — le stack standard ouvre trop facilement, ce qui donne un HSC insuffisant et du bottom-out.",
      pistonDia: 34, numPorts: 6, portDia: 3.5,
      shims: [
        { diameter: 44, thickness: 0.20, qty: 1, type: "face" },
        { diameter: 42, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 38, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 35, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 30, thickness: 0.20, qty: 2, type: "backup" },
        { diameter: 28, thickness: 0.25, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.25, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Split stack double crossover",
      desc: "Architecture split stack avancee avec deux crossover gaps. Trois zones de controle independantes : LSC (face shims), zone de transition (premier crossover), HSC (backups profonds via second crossover). Pour le tuning de precision.",
      pistonDia: 32, numPorts: 6, portDia: 3,
      shims: [
        { diameter: 40, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 38, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 20, thickness: 0.10, qty: 1, type: "crossover" },
        { diameter: 34, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 30, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 18, thickness: 0.10, qty: 1, type: "crossover" },
        { diameter: 28, thickness: 0.20, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.25, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Fox 40 GRIP2 compression (stock)",
      desc: "Stack de compression d'origine de la Fox 40 GRIP2 double couronne. Piston 34mm, 8 ports. Stack pyramidal classique mais plus raide que la 36/38 — concu pour la DH World Cup. Face shims larges et epais pour un LSC eleve et un HSC puissant adapte aux impacts a haute vitesse des pistes chronometrees.",
      pistonDia: 34, numPorts: 8, portDia: 3,
      shims: [
        { diameter: 46, thickness: 0.20, qty: 1, type: "face" },
        { diameter: 44, thickness: 0.15, qty: 1, type: "face" },
        { diameter: 40, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 38, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 34, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 30, thickness: 0.20, qty: 2, type: "backup" },
        { diameter: 28, thickness: 0.25, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.25, qty: 1, type: "backup" },
      ]
    },
    {
      name: "Fox 40 GRIP2 detente (stock)",
      desc: "Stack de detente d'origine de la Fox 40 GRIP2. Plus souple que le cote compression. Calibre pour un retour rapide sans kick-back — les pilotes DH WC ont besoin que la fourche revienne vite entre les impacts successifs sur les pistes techniques rapides.",
      pistonDia: 34, numPorts: 8, portDia: 3,
      shims: [
        { diameter: 44, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 40, thickness: 0.10, qty: 1, type: "face" },
        { diameter: 36, thickness: 0.10, qty: 1, type: "mid" },
        { diameter: 32, thickness: 0.15, qty: 1, type: "mid" },
        { diameter: 28, thickness: 0.15, qty: 1, type: "backup" },
        { diameter: 25, thickness: 0.20, qty: 1, type: "backup" },
      ]
    },
  ];

  const loadPreset = (preset) => {
    setPistonDia(preset.pistonDia);
    setNumPorts(preset.numPorts);
    setPortDia(preset.portDia);
    setShims(preset.shims.map(s => ({ ...s })));
  };

  /* ===========================================
     DRAG & DROP : reordonner les shims
     =========================================== */
  const handleDragStart = (idx) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDragLeave = () => {
    setOverIdx(null);
  };

  const handleDrop = (dropIdx) => {
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    setShims(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(dropIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const moveShim = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= shims.length) return;
    setShims(prev => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const getM = useCallback((thickness) => {
    return getInterpolatedMFactor(thickness);
  }, []);

  const calcStiffness = useCallback((shim) => {
    const m = getM(shim.thickness);
    const dRatio = shim.diameter / pistonDia;
    return m * Math.pow(dRatio, 2) * shim.qty;
  }, [pistonDia, getM]);

  const totalStiffness = shims.reduce((sum, s) => sum + calcStiffness(s), 0);
  const pistonArea = Math.PI * Math.pow(pistonDia / 2, 2);
  const portArea = numPorts * Math.PI * Math.pow(portDia / 2, 2);
  const shimCurve = useMemo(
    () => buildShimCurveData({ shims, pistonDia, numPorts, portDia }),
    [shims, pistonDia, numPorts, portDia]
  );

  // Classify profile
  const classifyProfile = () => {
    if (shims.length === 0) return "Indefini";
    const faceShims = shims.filter(s => s.diameter >= pistonDia * 1.1);
    const backupShims = shims.filter(s => s.diameter < pistonDia * 0.95);
    const hasCrossover = shims.some(s => s.type === "crossover");
    if (faceShims.length > backupShims.length + 1) return "Digressif";
    if (hasCrossover) return "Lineaire (crossover)";
    if (backupShims.length >= faceShims.length) return "Progressif";
    return "Composite";
  };

  const forceAt = (v) => {
    return interpolateCurveForce(shimCurve.points, v);
  };

  const addShim = () => {
    setShims(prev => [...prev, { diameter: newDia, thickness: newThick, qty: newQty, type: newType }]);
  };

  const removeShim = (idx) => {
    setShims(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <article className="page-content" data-testid="clapetteries-page">
      <h1>Modification des clapetteries</h1>
      <p className="page-subtitle">
        Guide pratique exhaustif pour la modification et le tuning des shim stacks
      </p>

      <nav className="toc">
        <h2>Sommaire</h2>
        <ul>
          <li><a href="#anatomie">Anatomie d'un shim stack</a></li>
          <li><a href="#principes">Principes de modification</a></li>
          <li><a href="#formules">Formules de reference</a></li>
          <li><a href="#atelier">Pratique atelier</a></li>
          <li><a href="#interactif">Tableau interactif de shim stack</a></li>
        </ul>
      </nav>

      {/* SECTION 1 : Anatomie */}
      <section id="anatomie">
        <h2>Anatomie d'un shim stack</h2>

        <h3>Terminologie</h3>
        <p>
          Un shim stack est un empilement de rondelles metalliques flexibles montees sur une tige,
          plaquees contre les ports du piston. Terminologie standard :
        </p>
        <ul>
          <li><strong>Face shim</strong> : le shim en contact direct avec le port du piston. C'est le premier a flechir. Son diametre et son epaisseur determinent le seuil d'ouverture initial (= controle du LSC)</li>
          <li><strong>Backup shim</strong> : les shims derriere le face shim. Ils soutiennent le face shim et controlent la rigidite a haute deflexion (= controle du HSC)</li>
          <li><strong>Crossover gap shim</strong> : un shim de petit diametre insere dans le stack pour creer un espace (gap) qui decouple le comportement basse et haute vitesse</li>
          <li><strong>Clamp shim/washer</strong> : la rondelle de serrage au bout du stack. Ne flechit pas. Definit le point d'appui du stack</li>
          <li><strong>Preload ring</strong> : une bague (spacer) entre le clamp et le dernier backup shim qui pre-contraint le stack. Augmente le seuil d'ouverture = plus de LSC</li>
        </ul>

        <h3>Dimensions</h3>
        <p>
          Les shims sont des rondelles en acier a ressort (acier C67S ou equivalent, durete ~45 HRC).
          Dimensions standard :
        </p>
        <ul>
          <li><strong>Diametre exterieur (OD)</strong> : de 8mm a 52mm selon le piston. Increments standards : 20, 22, 24, 25, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52mm</li>
          <li><strong>Diametre interieur (ID)</strong> : determine par la tige de clapets. Typiquement 6mm, 8mm ou 10mm selon l'architecture</li>
          <li><strong>Epaisseur</strong> : 0.10, 0.15, 0.20, 0.25, 0.30mm. L'epaisseur a un impact cubique sur la rigidite — un changement de 0.05mm est significatif</li>
        </ul>

        <h3>Convention de notation</h3>
        <p>
          La convention standard est <code>OD x epaisseur</code>. Exemple : <code>40x0.15</code> = shim de
          diametre 40mm, epaisseur 0.15mm. Un stack complet se note de haut en bas (face shim
          en premier) :
        </p>
        <div className="formula-block">
          <div className="formula-expr" style={{ fontSize: "14px" }}>
            40x0.15, 38x0.15, 35x0.10, 2x 30x0.15, 25x0.20 [clamp]
          </div>
          <div className="formula-desc">
            Face shim 40mm en 0.15, puis 38mm en 0.15, gap shim 35x0.10, 2 backup shims 30x0.15, et un 25x0.20 avant le clamp.
          </div>
        </div>

        <h3>Empilements types</h3>
        <ul>
          <li><strong>Pyramide (tapered)</strong> : diametres decroissants du face shim au clamp. Profil digressif. Standard de l'industrie</li>
          <li><strong>Split stack</strong> : deux sous-stacks separes par un crossover gap. Decouple LSC et HSC. Plus complexe a tuner mais plus flexible</li>
          <li><strong>Stacked crossover</strong> : plusieurs crossover gaps a differents niveaux. Permet des transitions tres progressives entre les plages de vitesse</li>
          <li><strong>Flat stack</strong> : tous les shims du meme diametre. Profil quasi-lineaire. Rarement utilise seul en VTT</li>
        </ul>
      </section>

      {/* SECTION 2 : Principes de modification */}
      <section id="principes">
        <h2>Principes de modification</h2>

        <h3>Augmenter le LSC</h3>
        <ul>
          <li>Augmenter le diametre du face shim : un face shim plus large couvre plus de surface de port, necessitant plus de pression pour flechir</li>
          <li>Augmenter l'epaisseur du face shim : l'impact est cubique. Passer de 0.10 a 0.15mm multiplie la rigidite par 3.37 (facteur M de Verdone)</li>
          <li>Ajouter un preload ring : la pre-contrainte retarde l'ouverture initiale du clapet. Le LSC augmente sans changer le HSC</li>
          <li>Ajouter des face shims supplementaires : empiler 2x le meme face shim double la rigidite initiale</li>
        </ul>

        <h3>Augmenter le HSC</h3>
        <ul>
          <li>Ajouter des backup shims en fond de stack : les backups soutiennent le face shim a haute deflexion. Plus de backups = plus de resistance a haute vitesse</li>
          <li>Augmenter l'epaisseur des backup shims : impact cubique sur la rigidite. Passer de 0.15 a 0.20 = x2.37 de rigidite</li>
          <li>Augmenter le diametre des backup shims : un backup plus large soutient le face shim sur une surface plus grande</li>
        </ul>

        <h3>Rendre plus lineaire</h3>
        <ul>
          <li>Ajouter un crossover gap : inserer un shim de petit diametre dans le stack. Le gap decouple les zones basse et haute vitesse, creant une transition plus douce</li>
          <li>Reduire le taper de la pyramide : rapprocher les diametres entre face shim et backup. Un stack moins pyramidal = moins de digressivite</li>
          <li>Utiliser des shims plus epais a plus petits diametres : la rigidite individuelle augmente sans changer le taper</li>
        </ul>

        <h3>Rendre plus digressif</h3>
        <ul>
          <li>Stack pyramidal simple : face shims larges et fins, backups petits et epais. Forte resistance initiale, puis plateau rapide</li>
          <li>Augmenter le ratio face/backup : plus le face shim est large par rapport aux backups, plus la digressivite est marquee</li>
          <li>Supprimer les crossover gaps : le gap linearise. Le retirer augmente la digressivite</li>
        </ul>

        <h3>Rendre plus progressif</h3>
        <ul>
          <li>Stack plat (faible taper) : shims de diametres similaires. L'huile passe principalement par les orifices, creant un profil v au carre</li>
          <li>Gros crossover gap : un gap important cree une zone morte ou l'amortissement est faible. Quand les backups entrent en jeu, la resistance augmente brusquement = progressif</li>
          <li>Spring-loaded preload : une forte pre-contrainte retarde l'ouverture. En dessous du seuil : orifice pur (progressif). Au-dessus : shim stack</li>
        </ul>

        <h3>Impact du preload ring</h3>
        <p>
          Le preload ring est une bague (spacer) placee entre le clamp et le dernier shim du
          stack. Il comprime le stack vers le piston, creant une <strong>pre-contrainte</strong>
          qui retarde l'ouverture du clapet.
        </p>
        <p>
          Effet : le LSC augmente (il faut plus de pression pour ouvrir le clapet). La courbe
          d'amortissement est decalee vers le haut a basse vitesse. A haute vitesse, une fois
          les shims ouverts, le preload a peu d'impact. Donc le preload rend la courbe
          <strong> plus degressive</strong>.
        </p>
      </section>

      {/* SECTION 3 : Formules */}
      <section id="formules">
        <h2>Formules de reference</h2>

        <div className="formula-block">
          <div className="formula-name">Conversion d'epaisseur de shim (Peter Verdone)</div>
          <div className="formula-expr">N2 = N1 x (M1 / M2)</div>
          <div className="formula-desc">
            Pour remplacer N1 shims d'epaisseur t1 par N2 shims d'epaisseur t2 a rigidite equivalente.
            Facteurs M par epaisseur : 0.10mm = 1.0, 0.15mm = 3.37, 0.20mm = 8.0, 0.25mm = 15.6, 0.30mm = 27.0
          </div>
          <div className="formula-source">Source : peterverdone.com/archive/highspeed.htm</div>
        </div>

        <div className="formula-block">
          <div className="formula-name">Moment d'inertie de section annulaire</div>
          <div className="formula-expr">I = (pi/64)(OD4 - ID4)</div>
          <div className="formula-desc">
            Approximation de la rigidite en flexion d'un shim annulaire encastre. OD = diametre exterieur,
            ID = diametre interieur. En mm4.
          </div>
          <div className="formula-source">Source : theorie des poutres — mecanique des materiaux</div>
        </div>

        <div className="formula-block">
          <div className="formula-name">Rigidite combinee d'un stack</div>
          <div className="formula-expr">K_total = Sum(K_i) pour chaque shim</div>
          <div className="formula-desc">
            Somme des rigidites individuelles. Modele simplifie (poutre en porte-a-faux avec appui au port).
            Ne couvre pas les effets de crossover ni le preload.
          </div>
          <div className="formula-source">Source : shimrestackor.com, motoklik.com</div>
        </div>

        <div className="formula-block">
          <div className="formula-name">Debit a travers un orifice</div>
          <div className="formula-expr">Q = Cd x A x sqrt(2.dP / rho)</div>
          <div className="formula-desc">
            Equation de Bernoulli simplifiee. Cd = coefficient de decharge (~0.6-0.8), A = section de passage (m2),
            dP = difference de pression (Pa), rho = masse volumique de l'huile (~850 kg/m3 pour huile de fourche).
          </div>
          <div className="formula-source">Source : mecanique des fluides — orifice flow</div>
        </div>

        <div className="formula-block">
          <div className="formula-name">Force d'amortissement theorique</div>
          <div className="formula-expr">F = dP x A_port</div>
          <div className="formula-desc">
            La force sur le piston = pression differentielle x section totale des ports.
            A_port = n_ports x pi x (d_port/2)2.
          </div>
          <div className="formula-source">Source : principes fondamentaux hydraulique</div>
        </div>

        <h3>Table des facteurs M (Verdone)</h3>
        <table className="tech-table" data-testid="m-factors-table">
          <thead>
            <tr>
              <th>Epaisseur (mm)</th>
              <th>Facteur M</th>
              <th>Ratio vs 0.10mm</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0.10</td><td>1.0</td><td>x1.0</td></tr>
            <tr><td>0.15</td><td>3.37</td><td>x3.37</td></tr>
            <tr><td>0.20</td><td>8.0</td><td>x8.0</td></tr>
            <tr><td>0.25</td><td>15.6</td><td>x15.6</td></tr>
            <tr><td>0.30</td><td>27.0</td><td>x27.0</td></tr>
          </tbody>
        </table>
      </section>

      {/* SECTION 4 : Pratique atelier */}
      <section id="atelier">
        <h2>Pratique atelier</h2>

        <h3>Outillage necessaire</h3>
        <ul>
          <li><strong>Micrometre 0-25mm</strong> (resolution 0.01mm) : indispensable pour mesurer l'epaisseur exacte des shims. Un pied a coulisse n'est pas assez precis</li>
          <li><strong>Jeu de shims de remplacement</strong> : avoir un assortiment de diametres et epaisseurs courants. Commander par lots chez les fournisseurs specialises</li>
          <li><strong>Cle dynamometrique</strong> : pour le serrage du clamp. Couple spec variable selon les marques (Fox : 1.1 Nm typique, verifier la spec exacte)</li>
          <li><strong>Banc de maintien</strong> : vise souple ou support dedie pour maintenir la cartouche pendant le travail</li>
          <li><strong>Seringue pour purge</strong> : seringue 60ml avec embout adapte pour la purge du circuit</li>
          <li><strong>Bagues de serrage</strong> et outils specifiques au constructeur</li>
        </ul>

        <h3>Sources d'approvisionnement shims</h3>
        <ul>
          <li><strong>SKF</strong> : shims de precision, qualite industrielle</li>
          <li><strong>Race Tech Gold Valve</strong> : kits de shims pour moto et VTT, bonne documentation</li>
          <li><strong>Shim Haus</strong> : specialiste shims suspension, large gamme de diametres et epaisseurs</li>
          <li><strong>Pieces OEM</strong> : Fox, RockShox, BOS fournissent des kits de shims de remplacement pour certains modeles</li>
        </ul>

        <h3>Protocole de travail</h3>
        <ol>
          <li><strong>Documenter le stack existant</strong> : photographier + noter chaque shim dans un tableau AVANT demontage. Diametre, epaisseur, position, etat. C'est la reference pour revenir en arriere</li>
          <li><strong>Travailler propre</strong> : surface propre, gants nitrile, pas de poussiere. Les shims sont sensibles a la contamination</li>
          <li><strong>Huile neuve</strong> : toujours remonter avec de l'huile neuve. Ne jamais reutiliser l'huile usagee</li>
          <li><strong>Purge soignee</strong> : suivre la procedure constructeur a la lettre. Une bulle d'air ruine le comportement</li>
          <li><strong>Un seul changement a la fois</strong> : modifier un parametre, tester, noter, iterer. Ne jamais changer plusieurs choses en meme temps</li>
        </ol>

        <h3>Viscosite d'huile</h3>
        <p>
          La viscosite de l'huile a un impact direct sur l'amortissement. En VTT, on utilise
          des huiles de grade <strong>ISO VG 3 a VG 15</strong> (correspondant a environ
          2.5wt a 15wt en classification moto).
        </p>
        <table className="tech-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Usage</th>
              <th>Temperature</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>2.5wt - 5wt</td><td>Fourches, cartouches detente</td><td>15-30 degC</td></tr>
            <tr><td>5wt - 7wt</td><td>Cartouches compression, amortisseurs mono-tube</td><td>10-25 degC</td></tr>
            <tr><td>7wt - 10wt</td><td>Amortisseurs piggyback, conditions froides</td><td>0-15 degC</td></tr>
            <tr><td>10wt - 15wt</td><td>Tres basse temperature, DH extreme</td><td>-5 a 10 degC</td></tr>
          </tbody>
        </table>

        <h3>Huiles de reference</h3>
        <ul>
          <li><strong>Maxima Plush</strong> : huile RockShox officielle. Haut indice de viscosite, bonne stabilite thermique</li>
          <li><strong>Fox Gold</strong> : huile Fox officielle. Formulee pour les cartouches fermees Fox</li>
          <li><strong>Motorex</strong> : fournisseur officiel BOS. Huiles de haute qualite a VI eleve</li>
          <li><strong>Putoline</strong> : huile moto adaptee VTT, bonne gamme de viscosites</li>
        </ul>
      </section>

      {/* SECTION 5 : Module interactif */}
      <section id="interactif">
        <h2>Tableau interactif de shim stack</h2>
        <p>
          Module interactif permettant de saisir un shim stack et d'obtenir une analyse.
          Estimateur simplifie base sur les formules publiques. Ce n'est PAS un clone de Shim ReStackor.
        </p>

        {/* ---- PRESETS ---- */}
        <div className="calc-section">
          <h3>Configurations de base (presets)</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Cliquez sur un preset pour charger la configuration dans l'editeur. Chaque preset
            est un point de depart — modifiez ensuite les shims selon vos besoins.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }} data-testid="presets-grid">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => loadPreset(p)}
                data-testid={`preset-${i}`}
                style={{
                  background: "var(--code-bg)",
                  border: "1px solid var(--borders)",
                  borderRadius: "4px",
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--pink)"; e.currentTarget.style.background = "rgba(255,20,147,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--borders)"; e.currentTarget.style.background = "var(--code-bg)"; }}
              >
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--pink)", marginBottom: "6px" }}>{p.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{p.desc}</div>
                <div style={{ fontSize: "10px", color: "var(--borders)", marginTop: "6px" }}>
                  Piston {p.pistonDia}mm | {p.shims.length} shims | {p.numPorts} ports x {p.portDia}mm
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ---- Inputs piston ---- */}
        <div className="calc-section">
          <h3>Parametres du piston</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Diametre piston (mm)</label>
              <input type="number" value={pistonDia} onChange={e => setPistonDia(Number(e.target.value))} min="15" max="50" data-testid="input-piston-dia" />
            </div>
            <div className="form-group">
              <label>Nombre de ports</label>
              <input type="number" value={numPorts} onChange={e => setNumPorts(Number(e.target.value))} min="1" max="12" data-testid="input-num-ports" />
            </div>
            <div className="form-group">
              <label>Diametre de chaque port (mm)</label>
              <input type="number" value={portDia} onChange={e => setPortDia(Number(e.target.value))} min="1" max="10" step="0.5" data-testid="input-port-dia" />
            </div>
          </div>
        </div>

        {/* ---- Shim list (drag & drop) ---- */}
        <div className="calc-section">
          <h3>Sequence de shims</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
            Glissez-deposez les lignes pour reordonner les shims, ou utilisez les fleches.
          </p>
          <table className="tech-table" data-testid="shim-stack-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}></th>
                <th>#</th>
                <th>Diametre (mm)</th>
                <th>Epaisseur (mm)</th>
                <th>Quantite</th>
                <th>Type</th>
                <th>Facteur M</th>
                <th>Rigidite</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shims.map((s, i) => (
                <tr
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                  data-testid={`shim-row-${i}`}
                  style={{
                    cursor: "grab",
                    opacity: dragIdx === i ? 0.4 : 1,
                    background: overIdx === i && dragIdx !== i ? "rgba(255,20,147,0.12)" : "transparent",
                    borderTop: overIdx === i && dragIdx !== null && dragIdx > i ? "2px solid var(--pink)" : undefined,
                    borderBottom: overIdx === i && dragIdx !== null && dragIdx < i ? "2px solid var(--pink)" : undefined,
                    transition: "opacity 0.15s, background 0.1s",
                  }}
                >
                  <td style={{ textAlign: "center", padding: "4px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                      <button
                        onClick={() => moveShim(i, -1)}
                        disabled={i === 0}
                        data-testid={`shim-up-${i}`}
                        style={{ background: "none", border: "none", color: i === 0 ? "var(--borders)" : "var(--text-muted)", cursor: i === 0 ? "default" : "pointer", fontSize: "14px", lineHeight: 1, padding: 0 }}
                        title="Monter"
                      >&#9650;</button>
                      <button
                        onClick={() => moveShim(i, 1)}
                        disabled={i === shims.length - 1}
                        data-testid={`shim-down-${i}`}
                        style={{ background: "none", border: "none", color: i === shims.length - 1 ? "var(--borders)" : "var(--text-muted)", cursor: i === shims.length - 1 ? "default" : "pointer", fontSize: "14px", lineHeight: 1, padding: 0 }}
                        title="Descendre"
                      >&#9660;</button>
                    </div>
                  </td>
                  <td>{i + 1}</td>
                  <td>{s.diameter}</td>
                  <td>{s.thickness}</td>
                  <td>{s.qty}</td>
                  <td>
                    <span style={{
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      background: s.type === "face" ? "rgba(255,20,147,0.15)" : s.type === "crossover" ? "rgba(255,170,0,0.15)" : s.type === "backup" ? "rgba(0,204,136,0.15)" : "rgba(160,160,176,0.1)",
                      color: s.type === "face" ? "var(--pink)" : s.type === "crossover" ? "var(--warning)" : s.type === "backup" ? "var(--success)" : "var(--text-muted)",
                    }}>{s.type}</span>
                  </td>
                  <td>{getM(s.thickness).toFixed(2)}</td>
                  <td>{calcStiffness(s).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => removeShim(i)}
                      style={{ background: "var(--error)", color: "#fff", border: "none", borderRadius: "3px", padding: "2px 8px", cursor: "pointer", fontSize: "11px" }}
                      data-testid={`remove-shim-${i}`}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add shim */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end", marginTop: "12px" }}>
            <div className="form-group" style={{ width: "100px" }}>
              <label>Dia (mm)</label>
              <input type="number" value={newDia} onChange={e => setNewDia(Number(e.target.value))} min="8" max="52" data-testid="input-new-dia" />
            </div>
            <div className="form-group" style={{ width: "100px" }}>
              <label>Epaisseur</label>
              <select value={newThick} onChange={e => setNewThick(Number(e.target.value))} data-testid="select-new-thick">
                <option value={0.10}>0.10</option>
                <option value={0.15}>0.15</option>
                <option value={0.20}>0.20</option>
                <option value={0.25}>0.25</option>
                <option value={0.30}>0.30</option>
              </select>
            </div>
            <div className="form-group" style={{ width: "80px" }}>
              <label>Quantite</label>
              <input type="number" value={newQty} onChange={e => setNewQty(Number(e.target.value))} min="1" max="10" data-testid="input-new-qty" />
            </div>
            <div className="form-group" style={{ width: "120px" }}>
              <label>Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} data-testid="select-new-type">
                <option value="face">Face</option>
                <option value="mid">Mid</option>
                <option value="backup">Backup</option>
                <option value="crossover">Crossover</option>
              </select>
            </div>
            <button className="calc-btn" onClick={addShim} data-testid="add-shim-btn">
              + Ajouter shim
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="calc-section">
          <h3>Analyse du stack</h3>
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Rigidite totale</div>
              <div className="result-value" data-testid="total-stiffness">{totalStiffness.toFixed(1)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Profil</div>
              <div className="result-value" style={{ fontSize: "16px" }} data-testid="stack-profile">{classifyProfile()}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Force @ 0.1 m/s</div>
              <div className="result-value" data-testid="force-01">{Math.round(forceAt(0.1))}<span className="result-unit">N</span></div>
            </div>
            <div className="result-card">
              <div className="result-label">Force @ 1.0 m/s</div>
              <div className="result-value" data-testid="force-10">{Math.round(forceAt(1.0))}<span className="result-unit">N</span></div>
            </div>
            <div className="result-card">
              <div className="result-label">Section ports totale</div>
              <div className="result-value" style={{ fontSize: "16px" }} data-testid="port-area">{portArea.toFixed(1)}<span className="result-unit">mm2</span></div>
            </div>
            <div className="result-card">
              <div className="result-label">Section piston</div>
              <div className="result-value" style={{ fontSize: "16px" }} data-testid="piston-area">{pistonArea.toFixed(1)}<span className="result-unit">mm2</span></div>
            </div>
          </div>
        </div>

        {/* Visualisation */}
        <div className="calc-section">
          <h3>Visualisation du stack</h3>
          <ShimStackVisual shims={shims} pistonDiameter={pistonDia} />
        </div>

        {/* Force vs Velocity chart */}
        <div className="calc-section">
          <h3>Courbe Force vs Velocity estimee</h3>
          <ShimFvVChart curveData={shimCurve} />
          <div className="results-grid" style={{ marginTop: "14px" }}>
            <div className="result-card" data-testid="curve-knee-card">
              <div className="result-label">Seuil de transition</div>
              <div className="result-value" style={{ fontSize: "16px" }}>{shimCurve.kneeVelocity.toFixed(2)}<span className="result-unit">m/s</span></div>
            </div>
            <div className="result-card" data-testid="curve-digressivity-card">
              <div className="result-label">Indice de digressivite</div>
              <div className="result-value" style={{ fontSize: "16px" }}>{shimCurve.digressivityIndex.toFixed(2)}</div>
            </div>
            <div className="result-card" data-testid="curve-sample-count-card">
              <div className="result-label">Points traces</div>
              <div className="result-value" style={{ fontSize: "16px" }}>{shimCurve.sampleCount}</div>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }} data-testid="shim-curve-note">
            Le trace depend maintenant de la sequence du stack, du taper, des epaisseurs, des quantites et des crossover shims. L'echelle verticale reste suffisamment stable pour comparer les reglages entre eux.
          </p>
        </div>

        {/* Diagnostic auto */}
        {shims.length > 0 && (
          <div className="calc-section" data-testid="stack-diagnostic">
            <h3>Diagnostic automatique</h3>
            <div style={{ background: "var(--code-bg)", border: "1px solid var(--borders)", borderRadius: "4px", padding: "14px" }}>
              {classifyProfile() === "Digressif" && (
                <p style={{ color: "var(--warning)" }}>
                  Stack digressif : forte resistance a basse vitesse, plateau en haute vitesse.
                  {totalStiffness > 30 ? " Rigidite elevee — adapte pour pilotes lourds ou DH agressif." : " Rigidite moderee — bon compromis enduro/trail."}
                  {" "}Pour lineariser, envisager un crossover gap entre face et backup shims.
                </p>
              )}
              {classifyProfile() === "Lineaire (crossover)" && (
                <p style={{ color: "var(--success)" }}>
                  Stack avec crossover : bon decouplage LSC/HSC. La transition entre basse et haute
                  vitesse est plus douce. Verifier que le gap est positionne au bon endroit dans le stack.
                </p>
              )}
              {classifyProfile() === "Progressif" && (
                <p style={{ color: "var(--pink)" }}>
                  Stack progressif : faible resistance a basse vitesse, montee rapide en haute vitesse.
                  Attention au manque de support au pedalage/freinage. Considerer l'ajout de face shims
                  plus larges pour augmenter le LSC.
                </p>
              )}
              {classifyProfile() === "Composite" && (
                <p style={{ color: "var(--text)" }}>
                  Stack composite : profil mixte. Analyser les ratios face/backup et la presence de
                  crossover gaps pour affiner le diagnostic.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
