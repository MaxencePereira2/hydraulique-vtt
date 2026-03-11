import { useEffect, useRef } from "react";

/* ======================================================
   Composant : Courbes Force vs Velocity (Canvas 2D)
   ====================================================== */
function ForceVelocityChart({ width = 700, height = 400 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    // Axes
    ctx.fillStyle = "#12121f";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#2a2a3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + h);
    ctx.lineTo(pad.left + w, pad.top + h);
    ctx.stroke();

    // Grille
    ctx.strokeStyle = "#1f1f30";
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 5; i++) {
      const y = pad.top + (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
    }
    for (let i = 1; i <= 5; i++) {
      const x = pad.left + (w / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + h);
      ctx.stroke();
    }

    // Labels axes
    ctx.fillStyle = "#a0a0b0";
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("Vitesse de tige (m/s)", pad.left + w / 2, height - 8);
    ctx.save();
    ctx.translate(14, pad.top + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Force (N)", 0, 0);
    ctx.restore();

    // Graduations
    ctx.fillStyle = "#a0a0b0";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let i = 0; i <= 5; i++) {
      const val = (i * 0.4).toFixed(1);
      ctx.fillText(val, pad.left + (w / 5) * i, pad.top + h + 18);
    }
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const val = ((5 - i) * 400).toString();
      ctx.fillText(val, pad.left - 8, pad.top + (h / 5) * i + 4);
    }

    // Courbe : lineaire  F = c * v
    const drawCurve = (fn, color, maxV) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= w; px++) {
        const v = (px / w) * maxV;
        const f = fn(v);
        const x = pad.left + px;
        const y = pad.top + h - (f / 2000) * h;
        if (px === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // Lineaire : F = 1000 * v
    drawCurve(v => 1000 * v, "#ff1493", 2.0);

    // Digressif : F = 800 * v^0.5 (sqrt) -> fort a basse V, plateau a haute V
    drawCurve(v => 800 * Math.pow(v, 0.5), "#00cc88", 2.0);

    // Progressif : F = 250 * v^2 -> faible a basse V, monte vite
    drawCurve(v => 250 * Math.pow(v, 2), "#ffaa00", 2.0);

  }, [width, height]);

  return (
    <div className="chart-container">
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        data-testid="fvv-chart"
      />
      <div className="chart-legend">
        <div className="chart-legend-item">
          <div className="chart-legend-swatch" style={{ background: "#ff1493" }} />
          <span style={{ color: "#a0a0b0" }}>Lineaire (F = c.v)</span>
        </div>
        <div className="chart-legend-item">
          <div className="chart-legend-swatch" style={{ background: "#00cc88" }} />
          <span style={{ color: "#a0a0b0" }}>Digressif (shim stack)</span>
        </div>
        <div className="chart-legend-item">
          <div className="chart-legend-swatch" style={{ background: "#ffaa00" }} />
          <span style={{ color: "#a0a0b0" }}>Progressif (orifice)</span>
        </div>
      </div>
    </div>
  );
}

export default function TypesAmortissement() {
  return (
    <article className="page-content" data-testid="types-amortissement-page">
      <h1>Types d'amortissement</h1>
      <p className="page-subtitle">
        Classification par profil de courbe, technologie de valve et plage de vitesse d'action
      </p>

      <nav className="toc">
        <h2>Sommaire</h2>
        <ul>
          <li><a href="#profil">Par profil de courbe d'amortissement</a></li>
          <li><a href="#technologie">Par technologie de valve</a></li>
          <li><a href="#plage-vitesse">Par plage de vitesse d'action</a></li>
        </ul>
      </nav>

      {/* ============================================
          SECTION 1 : Par profil de courbe
          ============================================ */}
      <section id="profil">
        <h2>Par profil de courbe d'amortissement</h2>

        <p>
          La courbe d'amortissement — Force en fonction de la Vitesse de tige (F vs V) — est
          la signature d'un damper. Elle definit comment la force de resistance augmente avec
          la vitesse de deplacement du piston. Trois profils fondamentaux existent, et la plupart
          des suspensions modernes utilisent des combinaisons de ces profils.
        </p>

        <ForceVelocityChart />

        <h3 id="lineaire">Lineaire : F = c . v</h3>
        <p>
          Le profil lineaire est le plus simple : la force d'amortissement est directement
          proportionnelle a la vitesse de tige. Le coefficient <code>c</code> (en N.s/m) est
          constant sur toute la plage de vitesse. Un amortisseur parfaitement lineaire produirait
          une droite sur le graphique F vs V.
        </p>
        <p>
          <strong>Avantages</strong> : comportement previsible, reponse proportionnelle a l'excitation.
          Le pilote sent une resistance qui augmente regulierement avec la violence des impacts.
        </p>
        <p>
          <strong>Inconvenients</strong> : a haute vitesse de tige (gros impacts), la force devient
          tres elevee — la suspension se durcit trop et transmet l'impact au pilote au lieu de l'absorber.
          C'est la raison pour laquelle les suspensions modernes ne sont jamais purement lineaires.
        </p>
        <p>
          <strong>Application</strong> : les dampers a ressort helicoidal sans valve de haute vitesse
          se rapprochent d'un profil lineaire. En pratique, aucun damper VTT moderne n'est purement
          lineaire — ils sont tous digressifs ou composites.
        </p>

        <h3 id="digressif">Digressif</h3>
        <p>
          Le profil digressif est le standard de l'industrie pour les suspensions VTT. La force
          d'amortissement augmente rapidement a basse vitesse de tige (0-50 mm/s), puis la
          courbe s'aplatit en haute vitesse. Le shim stack classique produit naturellement un
          profil digressif : les clapets (shims) offrent une forte resistance initiale a la
          flexion, puis une fois ouverts, la resistance augmente beaucoup plus lentement.
        </p>
        <p>
          <strong>Mecanisme</strong> : a basse vitesse, l'huile force a travers les ports du piston
          contre la resistance du shim stack. La flexion initiale des face shims requiert une force
          proportionnellement elevee. Une fois que les shims ont flechi au-dela de leur seuil
          d'ouverture, la section de passage augmente rapidement et la force n'augmente plus autant.
        </p>
        <p>
          Un shim stack pyramidal (tapered) — avec un diametre decroissant du face shim vers le
          backup — est l'archetype de la courbe digressive. Plus les face shims sont larges et
          fins, plus la digressivite est marquee.
        </p>
        <p>
          <strong>Avantages</strong> : bon support a basse vitesse (anti-squat, anti-dive, stabilite
          au pedalage), tout en laissant passer les gros impacts sans transmettre des forces excessives.
          C'est le compromis optimal pour le VTT.
        </p>

        <h3 id="progressif">Progressif</h3>
        <p>
          Le profil progressif est l'inverse du digressif : la force est faible a basse vitesse et
          augmente rapidement a haute vitesse. La courbe monte de facon convexe sur le graphique F vs V.
        </p>
        <p>
          <strong>Mecanisme</strong> : un orifice pur (bleed port sans shim stack) produit un profil
          progressif. L'equation de Bernoulli donne F proportionnel a v au carre (F ~ v²) pour un
          ecoulement a travers un orifice fixe. Plus le debit augmente, plus la resistance augmente
          de facon quadratique.
        </p>
        <p>
          <strong>Inconvenients</strong> : a basse vitesse, l'amortissement est trop faible pour
          controler le transfert de masse (la fourche plonge au freinage, l'amortisseur pompe au
          pedalage). C'est pourquoi les orifices purs ne sont jamais utilises seuls en VTT.
        </p>
        <p>
          <strong>Application</strong> : on retrouve un comportement progressif dans les valves
          a ressort (spring-loaded poppet valves) utilisees comme valves de securite (blow-off)
          sur certains amortisseurs. Egalement dans les systemes de bottom-out hydraulique (Fox
          Float X2 SSD, EXT HBC).
        </p>

        <h3 id="composites">Courbes composites</h3>
        <p>
          Les suspensions modernes haut de gamme combinent plusieurs profils pour optimiser
          le comportement sur toute la plage de vitesse. Les techniques de composition incluent :
        </p>
        <ul>
          <li>
            <strong>Crossover shim stacks</strong> : un gap (espace) dans le stack cree une zone
            de transition entre le comportement basse vitesse et haute vitesse. En dessous du gap,
            les face shims controlent le LSC. Au-dessus, les backup shims prennent le relais pour
            le HSC. Le crossover permet de separer le tuning LSC du HSC.
          </li>
          <li>
            <strong>Split stacks</strong> : deux shim stacks separes par une cale intermediaire,
            chacun gerant une plage de vitesse differente.
          </li>
          <li>
            <strong>Needle + shim stack</strong> : une needle valve (orifice variable) gere le
            debit basse vitesse, tandis que le shim stack gere le debit haute vitesse. C'est
            l'architecture standard de 99% des dampers VTT actuels (Fox GRIP2, RockShox Charger 3,
            BOS, Ohlins).
          </li>
        </ul>
      </section>

      {/* ============================================
          SECTION 2 : Par technologie de valve
          ============================================ */}
      <section id="technologie">
        <h2>Par technologie de valve</h2>

        <h3>Orifice pur (bleed port)</h3>
        <p>
          L'orifice pur est le dispositif d'amortissement le plus simple : un trou de diametre
          fixe dans le piston ou la paroi du cylindre. L'huile est forcee a travers ce trou,
          creant une resistance a l'ecoulement.
        </p>
        <p>
          La relation force-vitesse suit l'equation de Bernoulli simplifiee :
        </p>
        <div className="formula-block">
          <div className="formula-name">Debit a travers un orifice</div>
          <div className="formula-expr">Q = Cd x A x sqrt(2.dP / rho)</div>
          <div className="formula-desc">
            Cd = coefficient de decharge (~0.6-0.8), A = section de passage (m2),
            dP = difference de pression (Pa), rho = masse volumique de l'huile (kg/m3)
          </div>
          <div className="formula-source">Mecanique des fluides — orifice flow</div>
        </div>
        <p>
          Comme la force est proportionnelle a v au carre, le profil est <strong>progressif</strong>.
          Les orifices purs sont utilises comme bleed ports (ports de bypass) pour le reglage
          basse vitesse. Le reglage LSC par needle valve est essentiellement un orifice a section
          variable.
        </p>

        <h3>Shim stack (clapet flexible)</h3>
        <p>
          Le shim stack est un empilement de rondelles metalliques flexibles (shims) plaquees
          contre les ports du piston. Sous pression, les shims flechissent et ouvrent un passage
          pour l'huile. La rigidite des shims determine la force necessaire pour les ouvrir.
        </p>
        <p>
          Le profil produit est <strong>quasi-lineaire a basse vitesse</strong> (avant l'ouverture
          des shims), puis <strong>digressif</strong> une fois les shims ouverts. C'est la
          technologie dominante en suspension VTT et moto depuis les annees 1980.
        </p>
        <p>
          La rigidite d'un shim individuel depend de son diametre, son epaisseur et son materiau.
          L'epaisseur a un impact cubique sur la rigidite (doubler l'epaisseur multiplie la rigidite
          par 8). Le diametre a un impact au carre. C'est pourquoi les modifications de shim stack
          doivent etre faites avec precision — un changement de 0.05mm d'epaisseur peut modifier
          significativement le comportement.
        </p>

        <h3>Poppet valve / soupape a bille</h3>
        <p>
          La poppet valve est une soupape a seuil : un element mobile (bille, cone, disque) est
          maintenu ferme par un ressort. Quand la pression depasse le seuil de tarage du ressort,
          la soupape s'ouvre brusquement. Le profil est <strong>fortement digressif</strong> :
          resistance elevee jusqu'au seuil, puis chute rapide.
        </p>
        <p>
          En VTT, les poppet valves sont utilisees comme <strong>blow-off valves</strong> (valves
          de securite) pour proteger la suspension contre les impacts extremes. On les retrouve
          dans certains systemes de platform/lockout (Climb switches) et dans les bottom-out
          hydrauliques.
        </p>

        <h3>Spool valve</h3>
        <p>
          La spool valve est un cylindre mobile a l'interieur d'un fourreau, dont le deplacement
          ouvre ou ferme des ports de passage. Le profil est hautement configurable selon la
          geometrie des ports.
        </p>
        <p>
          En VTT, Fox utilise une architecture derivee de la spool valve dans le GRIP2 pour le
          reglage LSC. Cane Creek utilise un twin-tube avec une spool valve dans ses amortisseurs
          DB Air/DB Coil. L'avantage de la spool valve est sa linearite et sa plage d'ajustement
          large.
        </p>

        <h3>Needle valve</h3>
        <p>
          La needle valve est un cone pointu (aiguille) qui penetre plus ou moins dans un orifice,
          modulant la section de passage. C'est le mecanisme derriere les reglages de clics
          (clickers) LSC et LSR sur la plupart des suspensions.
        </p>
        <p>
          Chaque clic de reglage deplace l'aiguille d'un increment fixe (typiquement 0.05-0.1mm),
          modifiant la section de passage de quelques pourcents. La needle valve controle
          exclusivement le debit basse vitesse — elle n'a pas d'effet significatif au-dela
          de 50-100 mm/s de vitesse de tige.
        </p>

        <h3>Combinaisons modernes</h3>
        <p>
          99% des dampers VTT actuels utilisent une <strong>combinaison needle + shim stack</strong> :
        </p>
        <ul>
          <li>
            <strong>Needle valve</strong> pour le reglage basse vitesse (LSC/LSR) : ajustement
            externe par clics, plage d'action 0-50 mm/s
          </li>
          <li>
            <strong>Shim stack</strong> pour la haute vitesse (HSC/HSR) : modifiable uniquement
            par demontage et remplacement des shims
          </li>
          <li>
            <strong>Bypass port</strong> optionnel : orifice de decharge qui s'ouvre a une certaine
            pression ou position, pour adoucir un point specifique de la courbe
          </li>
        </ul>
        <p>
          Les dampers 4-way adjustable (Fox GRIP2, Cane Creek DBAir IL, Ohlins RXF 38) ajoutent
          un reglage externe supplementaire pour le HSC, typiquement via une bladder valve ou un
          piston additionnel.
        </p>
      </section>

      {/* ============================================
          SECTION 3 : Par plage de vitesse
          ============================================ */}
      <section id="plage-vitesse">
        <h2>Par plage de vitesse d'action</h2>

        <p>
          La vitesse de tige (shaft speed) est le parametre fondamental de l'amortissement.
          Elle se mesure en mm/s ou m/s. Les differents reglages d'une suspension agissent
          sur des plages de vitesse specifiques. Il est crucial de comprendre ces plages
          pour diagnostiquer et regler correctement une suspension.
        </p>

        <table className="tech-table" data-testid="speed-ranges-table">
          <thead>
            <tr>
              <th>Reglage</th>
              <th>Plage (mm/s)</th>
              <th>Situations terrain</th>
              <th>Mecanisme</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>LSC</strong> (Low-Speed Compression)</td>
              <td>0 - 50</td>
              <td>Transfert de masse (freinage, acceleration), pompage au pedalage, appui en virage</td>
              <td>Needle valve (clickers) + face shims du stack compression</td>
            </tr>
            <tr>
              <td><strong>HSC</strong> (High-Speed Compression)</td>
              <td>50 - 4000+</td>
              <td>Impacts racines, pierres, receptions de drops et sauts, nids de poule</td>
              <td>Shim stack compression (backup shims, preload, configuration globale)</td>
            </tr>
            <tr>
              <td><strong>LSR</strong> (Low-Speed Rebound)</td>
              <td>0 - 50</td>
              <td>Retour lent apres compression basse vitesse, suivi de terrain, maintien de l'assiette</td>
              <td>Needle valve detente (clickers) + face shims du stack detente</td>
            </tr>
            <tr>
              <td><strong>HSR</strong> (High-Speed Rebound)</td>
              <td>50 - 2000+</td>
              <td>Retour rapide apres gros impact, controle du packing, successions d'impacts rapides</td>
              <td>Shim stack detente (backup shims, configuration du stack rebound)</td>
            </tr>
          </tbody>
        </table>

        <h3>Low-Speed Compression (LSC)</h3>
        <p>
          Le LSC controle le comportement de la suspension lors des mouvements de faible amplitude
          et basse frequence : transfert de masse au freinage et en acceleration, pompage au pedalage,
          compression en virage. La vitesse de tige est typiquement entre 0 et 50 mm/s.
        </p>
        <p>
          Le reglage LSC se fait par la needle valve externe (clickers). Fermer le LSC augmente la
          resistance a basse vitesse — la suspension est plus ferme au pedalage et en appui, mais
          moins sensible aux petits impacts. Ouvrir le LSC rend la suspension plus souple et reactive,
          au detriment de la stabilite en phase de pedalage.
        </p>
        <p>
          Sur les cadres a faible anti-squat (mesure cinematique), un LSC eleve compense le bobbing.
          Sur les cadres a anti-squat eleve, un LSC faible est preferable pour maximiser la sensibilite.
        </p>

        <h3>High-Speed Compression (HSC)</h3>
        <p>
          Le HSC controle la resistance aux impacts violents : racines, pierres, receptions de drops
          et sauts. La vitesse de tige depasse 50 mm/s et peut atteindre plus de 4000 mm/s sur un
          impact severe (reception de drop de 2m+).
        </p>
        <p>
          Le HSC est determine par le shim stack compression. Les backup shims (shims de fond)
          controlent la rigidite du stack a haute deflexion, donc a haute vitesse. Augmenter le
          HSC (ajouter des backup shims ou augmenter leurs epaisseurs) previent le bottom-out mais
          rend la suspension moins confortable sur les impacts.
        </p>
        <p>
          Sur les suspensions 4-way (Fox GRIP2, Cane Creek DBAir IL), le HSC est aussi reglable
          par un clicker externe, bien que la plage de reglage soit plus limitee qu'une modification
          interne du shim stack.
        </p>

        <h3>Low-Speed Rebound (LSR)</h3>
        <p>
          Le LSR controle la vitesse de retour de la suspension apres une compression basse vitesse.
          Un LSR trop lent et la suspension reste enfoncee (packing). Trop rapide et elle renvoie
          le pilote (kick-back).
        </p>
        <p>
          Le reglage ideal : la suspension revient a sa position de SAG en environ 1 seconde apres
          une compression manuelle a fond, sans oscillation. C'est le "test du rebond" classique.
        </p>

        <h3>High-Speed Rebound (HSR)</h3>
        <p>
          Le HSR controle le retour apres un gros impact. C'est le reglage le plus critique pour
          prevenir le packing en DH : si la suspension revient trop lentement apres un gros impact,
          elle n'a pas le temps de se repositionner avant l'impact suivant.
        </p>
        <p>
          Le HSR n'est generalement pas reglable de l'exterieur (sauf sur les dampers 4-way haut
          de gamme). Il est controle par le shim stack detente — les backup shims cote detente.
          Les pilotes DH de haut niveau travaillent beaucoup sur le HSR pour optimiser le
          comportement en sections techniques rapides.
        </p>

        <h3>Seuils LSC/HSC : variations par marque</h3>
        <p>
          Les seuils de transition entre basse et haute vitesse varient selon les constructeurs :
        </p>
        <table className="tech-table">
          <thead>
            <tr>
              <th>Marque</th>
              <th>Seuil LSC/HSC</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fox</td>
              <td>~50-100 mm/s</td>
              <td>GRIP2 : LSC needle + HSC bladder valve. Sub Speed Damping (SSD) ajoute une couche de controle basse-basse vitesse</td>
            </tr>
            <tr>
              <td>RockShox</td>
              <td>~30-80 mm/s</td>
              <td>Charger 3 : LSC needle, HSC shim stack interne. Pas de reglage HSC externe sur la plupart des modeles</td>
            </tr>
            <tr>
              <td>BOS</td>
              <td>~40-100 mm/s</td>
              <td>Double clapetterie independante : chaque circuit (compression, detente) a son propre shim stack LSC et HSC</td>
            </tr>
            <tr>
              <td>Ohlins</td>
              <td>~50-120 mm/s</td>
              <td>Heritage moto. Seuils plus eleves, shim stacks plus raides. RXF 38 m.2 : 4-way adjustable avec plage etendue</td>
            </tr>
            <tr>
              <td>Cane Creek</td>
              <td>~40-80 mm/s</td>
              <td>Twin-tube : 4-way independent. Chaque circuit est physiquement separe avec son propre piston et shim stack</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
}
