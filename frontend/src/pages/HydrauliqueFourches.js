export default function HydrauliqueFourches() {
  return (
    <article className="page-content" data-testid="hydraulique-fourches-page">
      <h1>Hydraulique des fourches</h1>
      <p className="page-subtitle">
        Rappel complet et exhaustif du fonctionnement hydraulique des fourches VTT
      </p>

      {/* TOC */}
      <nav className="toc">
        <h2>Sommaire</h2>
        <ul>
          <li><a href="#architecture">Architecture generale d'une fourche hydraulique VTT</a></li>
          <li><a href="#compression">Circuit de compression</a></li>
          <li><a href="#detente">Circuit de detente (rebound)</a></li>
          <li><a href="#marques">Specificites par marque et architecture</a></li>
        </ul>
      </nav>

      {/* =============================================
          SECTION 1 : Architecture generale
          ============================================= */}
      <section id="architecture">
        <h2>Architecture generale d'une fourche hydraulique VTT</h2>

        <h3>Fourche a bain ouvert (open bath) vs cartouche fermee (closed cartridge)</h3>
        <p>
          Il existe deux grandes architectures de fourches VTT. La <strong>fourche a bain ouvert</strong>
          (open bath) utilise les fourreaux comme reservoir d'huile : l'huile d'amortissement est en
          contact direct avec l'air a l'interieur des fourreaux. La cartouche (piston + shim stacks)
          baigne dans ce volume d'huile non pressurise. C'est l'architecture historique, encore
          utilisee sur les fourches d'entree et de milieu de gamme.
        </p>
        <p>
          La <strong>cartouche fermee</strong> (closed cartridge) isole completement le circuit
          hydraulique dans une cartouche scellee. L'huile est confinee dans un tube etanche,
          avec un IFP (Internal Floating Piston) ou un bladder pour compenser le deplacement
          volumetrique de la tige. L'avantage principal : pas de risque d'aeration de l'huile
          (l'air et l'huile ne se melangent jamais), amortissement plus consistant, pas de
          sensibilite a l'orientation de la fourche.
        </p>
        <p>
          Les fourches de competition (Fox 36/38/40 GRIP2, RockShox ZEB/Boxxer Charger 3,
          Ohlins RXF 38) utilisent toutes des cartouches fermees. La cartouche fermee est aussi
          plus facile a purger correctement et maintient ses performances plus longtemps entre
          les services.
        </p>

        {/* SVG : coupe longitudinale open bath */}
        <div className="svg-container">
          <svg viewBox="0 0 440 520" width="440" height="520" data-testid="svg-open-bath">
            {/* Fourreau gauche */}
            <rect x="60" y="180" width="50" height="320" rx="4" fill="#1f1f30" stroke="#3a3a4e" strokeWidth="2" />
            <rect x="70" y="190" width="30" height="300" fill="#2a2a3e" />
            {/* Fourreau droit */}
            <rect x="330" y="180" width="50" height="320" rx="4" fill="#1f1f30" stroke="#3a3a4e" strokeWidth="2" />
            <rect x="340" y="190" width="30" height="300" fill="#2a2a3e" />
            {/* Plongeur gauche */}
            <rect x="72" y="30" width="26" height="220" rx="2" fill="#4a4a5e" stroke="#6a6a7e" strokeWidth="1" />
            {/* Plongeur droit */}
            <rect x="342" y="30" width="26" height="220" rx="2" fill="#4a4a5e" stroke="#6a6a7e" strokeWidth="1" />
            {/* Couronne */}
            <rect x="55" y="20" width="330" height="18" rx="3" fill="#3a3a4e" stroke="#5a5a6e" strokeWidth="1" />
            {/* Pivot de fourche */}
            <rect x="190" y="0" width="60" height="24" rx="10" fill="#3a3a4e" stroke="#5a5a6e" strokeWidth="1" />
            {/* Cartouche compression (gauche) */}
            <rect x="76" y="200" width="18" height="160" rx="2" fill="rgba(255,20,147,0.2)" stroke="#ff1493" strokeWidth="1" />
            {/* Piston compression */}
            <rect x="74" y="280" width="22" height="6" fill="#ff1493" />
            {/* Shim stack */}
            <rect x="76" y="287" width="18" height="2" fill="#e91e8c" />
            <rect x="78" y="290" width="14" height="2" fill="#e91e8c" />
            <rect x="80" y="293" width="10" height="2" fill="#e91e8c" />
            {/* Cartouche detente (droite) */}
            <rect x="346" y="200" width="18" height="160" rx="2" fill="rgba(0,204,136,0.2)" stroke="#00cc88" strokeWidth="1" />
            {/* Piston detente */}
            <rect x="344" y="300" width="22" height="6" fill="#00cc88" />
            {/* Shim stack detente */}
            <rect x="346" y="307" width="18" height="2" fill="#00cc88" />
            <rect x="348" y="310" width="14" height="2" fill="#00cc88" />
            {/* Huile (bath) */}
            <rect x="70" y="380" width="30" height="108" fill="rgba(255,170,0,0.15)" />
            <rect x="340" y="380" width="30" height="108" fill="rgba(255,170,0,0.15)" />
            {/* Chambre air positive */}
            <rect x="342" y="45" width="26" height="100" fill="rgba(0,150,255,0.1)" stroke="rgba(0,150,255,0.3)" strokeWidth="1" strokeDasharray="4 2" />
            {/* Labels */}
            <text x="220" y="14" textAnchor="middle" fill="#a0a0b0" fontSize="11" fontFamily="system-ui">Pivot</text>
            <text x="30" y="300" textAnchor="end" fill="#ff1493" fontSize="10" fontFamily="JetBrains Mono">Compression</text>
            <text x="410" y="320" textAnchor="start" fill="#00cc88" fontSize="10" fontFamily="JetBrains Mono">Detente</text>
            <text x="85" y="460" textAnchor="middle" fill="#ffaa00" fontSize="10" fontFamily="JetBrains Mono">Bain huile</text>
            <text x="355" y="100" textAnchor="middle" fill="rgba(0,150,255,0.6)" fontSize="10" fontFamily="JetBrains Mono">Air +</text>
            <text x="220" y="45" textAnchor="middle" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Couronne</text>
            <text x="45" y="195" textAnchor="end" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Fourreau</text>
            <text x="60" y="130" textAnchor="end" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Plongeur</text>
            {/* Fleches flux compression */}
            <line x1="85" y1="260" x2="85" y2="275" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#arrowPink)" />
            {/* Fleches flux detente */}
            <line x1="355" y1="330" x2="355" y2="315" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
            {/* Arrow markers */}
            <defs>
              <marker id="arrowPink" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ff1493" />
              </marker>
              <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#00cc88" />
              </marker>
            </defs>
          </svg>
          <p className="svg-caption">Coupe longitudinale — Fourche a bain ouvert (open bath). Gauche : cartouche compression. Droite : cartouche detente.</p>
        </div>

        <h3>Plongeurs, fourreaux, cartouches</h3>
        <p>
          Les <strong>plongeurs</strong> (stanchions / tubes superieurs) sont les tubes de petit
          diametre fixes a la couronne. Ils coulissent a l'interieur des <strong>fourreaux</strong>
          (lowers / tubes inferieurs) qui portent l'axe de roue. Le diametre des plongeurs
          determine la rigidite laterale de la fourche : 32mm (XC), 34mm (trail), 35mm (enduro),
          36mm (enduro/DH), 38mm (DH), 40mm (DH double couronne).
        </p>
        <p>
          Le cote gauche de la fourche contient generalement la <strong>cartouche de compression</strong>
          (damper side), et le cote droit contient le <strong>ressort</strong> (air ou helicoidal)
          et la <strong>cartouche de detente</strong>. Sur certaines fourches (Manitou Mezzer),
          le ressort et l'amortissement sont du meme cote.
        </p>

        <h3>Chambre d'air : volume positif, volume negatif, tokens, progressivite</h3>
        <p>
          Sur les fourches a ressort pneumatique, la <strong>chambre positive</strong> est le volume
          d'air au-dessus du piston du ressort. C'est cette pression qui supporte le poids du pilote.
          La <strong>chambre negative</strong> est le volume d'air en dessous du piston. Elle
          agit en opposition a la chambre positive : elle "tire" la fourche dans son debattement,
          facilitant l'initiation du mouvement (sensibilite en debut de course).
        </p>
        <p>
          Les <strong>tokens</strong> (Fox) ou <strong>spacers</strong> (RockShox, Manitou) sont
          des pieces en plastique inserees dans la chambre positive pour reduire son volume.
          Moins de volume = compression plus rapide de l'air = plus de progressivite en fin
          de course. Chaque token ajoute environ 8-12% de progressivite supplementaire. Sur
          une Fox 36 avec 160mm de debattement, on peut mettre de 0 a 5 tokens.
        </p>
        <p>
          Le systeme <strong>DebonAir+</strong> de RockShox utilise un volume negatif agrandi
          pour ameliorer la sensibilite initiale. Le systeme <strong>IRT</strong> (Infinite Rate
          Tune) de Manitou permet un reglage independant de la pression positive et negative.
        </p>

        <h3>Ressort helicoidal</h3>
        <p>
          Le ressort helicoidal (coil spring) offre un taux de ressort (spring rate) lineaire :
          la force est proportionnelle au deplacement (F = k.x, loi de Hooke). Le spring rate
          s'exprime en N/mm ou lbs/in (1 N/mm = 5.71 lbs/in). La precharge (preload) est
          un reglage qui comprime le ressort au repos, augmentant la force initiale sans
          changer le spring rate.
        </p>
        <p>
          Avantages du coil : sensibilite superieure (pas de friction de joints d'air),
          linearite, consistance thermique. Inconvenients : poids (+200-300g vs air),
          pas de reglage de progressivite (la courbe de force est une droite).
        </p>

        <h3>Circuit d'huile : flux compression et detente separes</h3>
        <p>
          Le circuit hydraulique d'une fourche gere deux flux d'huile distincts. En
          <strong> compression</strong>, l'huile est poussee a travers les ports du piston de
          compression et le shim stack correspondant. En <strong>detente</strong> (rebound),
          l'huile circule en sens inverse a travers les ports du piston de detente. Les deux
          circuits sont separes par des clapets anti-retour (check valves) qui imposent le
          sens de circulation.
        </p>
      </section>

      {/* =============================================
          SECTION 2 : Circuit de compression
          ============================================= */}
      <section id="compression">
        <h2>Circuit de compression</h2>

        <h3>Base valve (pied de fourche)</h3>
        <p>
          La <strong>base valve</strong> est une valve situee en pied de fourche (bas du fourreau).
          Dans les architectures a bain ouvert, c'est la premiere restriction que l'huile rencontre
          en compression. La base valve contient un shim stack de compression qui controle le flux
          d'huile du volume au-dessus du piston vers le volume en dessous.
        </p>
        <p>
          Dans les cartouches fermees, la base valve peut etre integree au bas de la cartouche
          ou deplacee dans un reservoir externe. Sur les Fox 36/38 GRIP2, la base valve est
          interne a la cartouche. Sur les amortisseurs piggyback, la base valve est deportee
          dans le reservoir.
        </p>

        <h3>Mid-valve (piston flottant)</h3>
        <p>
          La <strong>mid-valve</strong> est un piston libre situe au milieu de la cartouche.
          Elle reagit a la pression differentielle creee par le mouvement du piston principal.
          La mid-valve ajoute une couche de controle supplementaire : elle gere une partie du
          flux d'huile independamment de la base valve, permettant un profil d'amortissement
          plus complexe.
        </p>
        <p>
          Le systeme Fox <strong>FIT</strong> (Fox Isolated Technology) utilise une mid-valve
          comme element principal d'amortissement. L'interaction entre mid-valve et base valve
          permet de creer des profils d'amortissement composites avec des transitions douces
          entre basse et haute vitesse.
        </p>

        <h3>Clapet de compression basse vitesse (LSC)</h3>
        <p>
          Le reglage <strong>LSC</strong> (Low-Speed Compression) controle la resistance a
          l'ecoulement pour les vitesses de tige de 0 a 50 mm/s. Le mecanisme est une
          <strong> needle valve</strong> (valve a aiguille) : un cone pointu dont la position
          dans un orifice determine la section de passage de l'huile.
        </p>
        <p>
          Chaque clic de reglage LSC deplace l'aiguille d'un increment fixe. En position fermee
          (maximum de clics), la section de passage est minimale — la resistance basse vitesse
          est maximale. En position ouverte (0 clics), le bypass est maximal et la resistance
          basse vitesse minimale.
        </p>
        <p>
          Le LSC agit en parallele du shim stack : l'huile circule a la fois a travers l'orifice
          de la needle valve ET a travers les ports du piston + shim stack. A basse vitesse, la
          needle valve est le chemin de moindre resistance. A haute vitesse, les shims ouvrent
          et le shim stack prend le relais.
        </p>

        <h3>Clapet de compression haute vitesse (HSC)</h3>
        <p>
          Le <strong>HSC</strong> est controle par le <strong>shim stack</strong> de compression :
          un empilement de rondelles metalliques flexibles (shims) plaquees contre les ports du
          piston. Quand la pression differentielle depasse le seuil de flexion des shims, ceux-ci
          flechissent et ouvrent un passage pour l'huile.
        </p>
        <p>
          La configuration du shim stack (nombre, diametre, epaisseur, ordre des shims) determine
          le profil d'amortissement haute vitesse. Un stack avec de grands face shims fins
          produit un profil digressif. Un stack avec des shims epais et un crossover gap produit
          un profil plus lineaire.
        </p>

        <h3>Interaction LSC/HSC</h3>
        <p>
          La courbe d'amortissement totale en compression est la <strong>somme des contributions</strong>
          de la needle valve (LSC) et du shim stack (HSC). A tres basse vitesse (0-20 mm/s),
          la needle valve domine. A haute vitesse (100+ mm/s), le shim stack domine. Entre les
          deux, il y a une zone de transition ou les deux mecanismes contribuent.
        </p>
        <p>
          Modifier le LSC (clics) decale la courbe verticalement dans la zone basse vitesse sans
          affecter la haute vitesse. Modifier le shim stack (remplacement de shims) change la
          pente et la forme de la courbe en haute vitesse. C'est pourquoi le reglage optimal
          requiert souvent les deux : clics LSC pour le comportement pedalage/freinage, et
          modification du shim stack pour le comportement impact.
        </p>

        {/* SVG : flux compression */}
        <div className="svg-container">
          <svg viewBox="0 0 400 300" width="400" height="300" data-testid="svg-compression-flow">
            {/* Cartouche tube */}
            <rect x="100" y="30" width="200" height="240" rx="6" fill="none" stroke="#3a3a4e" strokeWidth="2" />
            {/* Piston */}
            <rect x="110" y="130" width="180" height="12" fill="#ff1493" rx="2" />
            {/* Ports */}
            <rect x="140" y="132" width="8" height="8" fill="#12121f" />
            <rect x="200" y="132" width="8" height="8" fill="#12121f" />
            <rect x="260" y="132" width="8" height="8" fill="#12121f" />
            {/* Shim stack sous le piston */}
            <rect x="130" y="144" width="140" height="3" fill="#e91e8c" rx="1" />
            <rect x="140" y="148" width="120" height="3" fill="#e91e8c" rx="1" />
            <rect x="150" y="152" width="100" height="3" fill="#e91e8c" rx="1" />
            {/* Tige */}
            <rect x="192" y="10" width="16" height="120" fill="#4a4a5e" />
            {/* Needle valve (bypass) */}
            <rect x="115" y="128" width="14" height="16" fill="none" stroke="#ffaa00" strokeWidth="1.5" rx="2" />
            <line x1="122" y1="130" x2="122" y2="142" stroke="#ffaa00" strokeWidth="1.5" />
            {/* Oil arrows - compression direction (down) */}
            <line x1="145" y1="100" x2="145" y2="125" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#aPink)" />
            <line x1="205" y1="100" x2="205" y2="125" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#aPink)" />
            <line x1="265" y1="100" x2="265" y2="125" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#aPink)" />
            {/* Oil past shims */}
            <line x1="145" y1="158" x2="145" y2="190" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#aPink)" />
            <line x1="205" y1="158" x2="205" y2="190" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#aPink)" />
            <line x1="265" y1="158" x2="265" y2="190" stroke="#ff1493" strokeWidth="1.5" markerEnd="url(#aPink)" />
            {/* Bypass flow */}
            <path d="M 122 115 Q 108 125 122 140" fill="none" stroke="#ffaa00" strokeWidth="1" strokeDasharray="3 2" />
            {/* Labels */}
            <text x="200" y="80" textAnchor="middle" fill="#ff1493" fontSize="11" fontFamily="system-ui">Chambre haute pression</text>
            <text x="200" y="220" textAnchor="middle" fill="#a0a0b0" fontSize="11" fontFamily="system-ui">Chambre basse pression</text>
            <text x="200" y="168" textAnchor="middle" fill="#e91e8c" fontSize="10" fontFamily="JetBrains Mono">Shim stack (HSC)</text>
            <text x="80" y="138" textAnchor="end" fill="#ffaa00" fontSize="10" fontFamily="JetBrains Mono">Needle (LSC)</text>
            <text x="200" y="252" textAnchor="middle" fill="#a0a0b0" fontSize="9" fontFamily="system-ui">Fleches = direction du flux d'huile en compression</text>
            <defs>
              <marker id="aPink" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ff1493" />
              </marker>
            </defs>
          </svg>
          <p className="svg-caption">Schema du flux d'huile en compression. L'huile traverse les ports du piston et flechit les shims (HSC). Le bypass de la needle valve controle le LSC.</p>
        </div>
      </section>

      {/* =============================================
          SECTION 3 : Circuit de detente
          ============================================= */}
      <section id="detente">
        <h2>Circuit de detente (rebound)</h2>

        <h3>Piston de detente</h3>
        <p>
          Le <strong>piston de detente</strong> controle le retour de la fourche apres compression.
          En detente, la force du ressort (air ou helicoidal) pousse la fourche vers l'extension.
          L'huile est forcee a travers les ports du piston de detente en sens inverse de la
          compression — le shim stack detente est de l'autre cote du piston.
        </p>
        <p>
          Le shim stack detente est generalement plus souple que le stack compression, car la
          force de rappel du ressort est la seule force motrice (pas d'impact externe). Un
          stack detente trop raide = packing (la suspension ne revient pas). Trop souple
          = kick-back (retour trop rapide).
        </p>

        <h3>Reglage basse vitesse detente (LSR)</h3>
        <p>
          Le <strong>LSR</strong> (Low-Speed Rebound) est controle par une needle valve similaire
          au LSC mais cote detente. C'est le reglage de rebound "classique" que l'on trouve sur
          toutes les fourches. Il controle la vitesse de retour lors des mouvements lents : retour
          apres compression au freinage, maintien de l'assiette, suivi de terrain ondulant.
        </p>
        <p>
          Le test de reglage : comprimer la fourche a fond a la main, relacher. La fourche doit
          revenir a sa position de SAG en 1-1.5 seconde, sans rebondir au-dela. Si elle rebondit,
          le LSR est trop rapide (fermer). Si elle revient lentement et pesamment, le LSR est
          trop lent (ouvrir).
        </p>

        <h3>Haute vitesse detente (HSR)</h3>
        <p>
          Le <strong>HSR</strong> est determine par le shim stack detente. Il controle la vitesse
          de retour apres un gros impact. C'est un parametre critique en DH : sur des sections
          rapides avec des enchainements d'impacts (racines, pierres), la suspension doit revenir
          assez vite pour etre prete pour l'impact suivant.
        </p>
        <p>
          Le HSR n'est pas reglable de l'exterieur sur la majorite des fourches (exception :
          Fox 40 GRIP2, Ohlins RXF 38 m.2). Pour le modifier, il faut demonter la cartouche
          et modifier le shim stack detente — ajouter ou retirer des shims, changer les epaisseurs.
        </p>

        <h3>IFP (Internal Floating Piston) ou bladder</h3>
        <p>
          Dans une cartouche fermee, le deplacement de la tige du piston dans le cylindre change
          le volume total : quand la tige entre dans la cartouche, elle occupe du volume et l'huile
          incompressible n'a nulle part ou aller. L'<strong>IFP</strong> (piston flottant interne)
          ou le <strong>bladder</strong> (membrane souple) compensent ce changement volumetrique.
        </p>
        <p>
          L'IFP est un piston libre avec un joint torique, separe de l'huile par un volume d'azote
          sous pression (typiquement 150-250 psi). Quand la tige entre dans la cartouche, l'IFP
          se deplace pour compenser, comprimant l'azote. La pression d'azote a un impact direct
          sur l'amortissement en fin de course et la resistance a la cavitation.
        </p>
        <p>
          Le bladder (utilise par Fox dans certains modeles) remplace le piston metallique par une
          membrane souple — moins de friction, meilleure sensibilite, mais plus fragile a haute
          pression et temperature.
        </p>

        {/* SVG : flux detente */}
        <div className="svg-container">
          <svg viewBox="0 0 400 300" width="400" height="300" data-testid="svg-rebound-flow">
            {/* Cartouche */}
            <rect x="100" y="30" width="200" height="240" rx="6" fill="none" stroke="#3a3a4e" strokeWidth="2" />
            {/* Piston */}
            <rect x="110" y="140" width="180" height="12" fill="#00cc88" rx="2" />
            {/* Ports */}
            <rect x="140" y="142" width="8" height="8" fill="#12121f" />
            <rect x="200" y="142" width="8" height="8" fill="#12121f" />
            <rect x="260" y="142" width="8" height="8" fill="#12121f" />
            {/* Shim stack au-dessus du piston */}
            <rect x="130" y="134" width="140" height="3" fill="#00cc88" rx="1" />
            <rect x="140" y="130" width="120" height="3" fill="#00cc88" rx="1" />
            <rect x="150" y="126" width="100" height="3" fill="#00cc88" rx="1" />
            {/* Tige */}
            <rect x="192" y="10" width="16" height="130" fill="#4a4a5e" />
            {/* IFP */}
            <rect x="110" y="230" width="180" height="10" fill="#ffaa00" rx="2" />
            <text x="200" y="257" textAnchor="middle" fill="#ffaa00" fontSize="10" fontFamily="JetBrains Mono">IFP (N2: 200 psi)</text>
            {/* Oil arrows - rebound direction (up) */}
            <line x1="145" y1="190" x2="145" y2="160" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#aGreen)" />
            <line x1="205" y1="190" x2="205" y2="160" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#aGreen)" />
            <line x1="265" y1="190" x2="265" y2="160" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#aGreen)" />
            {/* Past shims */}
            <line x1="145" y1="122" x2="145" y2="90" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#aGreen)" />
            <line x1="205" y1="122" x2="205" y2="90" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#aGreen)" />
            <line x1="265" y1="122" x2="265" y2="90" stroke="#00cc88" strokeWidth="1.5" markerEnd="url(#aGreen)" />
            {/* Labels */}
            <text x="200" y="78" textAnchor="middle" fill="#a0a0b0" fontSize="11" fontFamily="system-ui">Chambre cote tige</text>
            <text x="200" y="210" textAnchor="middle" fill="#a0a0b0" fontSize="11" fontFamily="system-ui">Chambre IFP</text>
            <text x="200" y="120" textAnchor="middle" fill="#00cc88" fontSize="10" fontFamily="JetBrains Mono">Shim stack detente</text>
            <text x="200" y="280" textAnchor="middle" fill="#a0a0b0" fontSize="9" fontFamily="system-ui">Fleches = flux d'huile en detente (extension)</text>
            <defs>
              <marker id="aGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#00cc88" />
              </marker>
            </defs>
          </svg>
          <p className="svg-caption">Schema du flux d'huile en detente. Le ressort pousse le piston vers le haut, l'huile traverse le shim stack detente. L'IFP compense le volume de la tige.</p>
        </div>
      </section>

      {/* =============================================
          SECTION 4 : Specificites par marque
          ============================================= */}
      <section id="marques">
        <h2>Specificites par marque et architecture</h2>

        <h3>Fox FIT4 / GRIP / GRIP2</h3>
        <p>
          <strong>FIT4</strong> : cartouche fermee a 3 modes (Open, Medium, Firm). La cartouche
          utilise un charley damper (valve rotative) pour changer le circuit hydraulique entre
          les modes. En mode Open, le LSC est minimal et le shim stack gere tout. En mode Firm,
          le bypass est ferme — forte resistance a basse vitesse avec blow-off en haute vitesse.
        </p>
        <p>
          <strong>GRIP</strong> : version simplifiee avec un reglage LSC par sweep (bouton rotatif)
          au lieu des 3 modes. Meme cartouche fermee, meme principe.
        </p>
        <p>
          <strong>GRIP2</strong> : damper 4-way adjustable. LSC (low-speed compression) et
          HSC (high-speed compression) reglables independamment a l'exterieur, plus LSR et
          HSR (low/high speed rebound). L'architecture utilise une mid-valve avec une
          bladder valve pour le HSC. C'est le damper de reference en DH et enduro race.
          Le reglage LSC agit via une needle valve. Le HSC agit sur la pre-charge d'une
          bladder qui controle le seuil d'ouverture du shim stack principal.
        </p>

        <h3>RockShox Charger 2 / 2.1 / 3</h3>
        <p>
          <strong>Charger 2 / RC2</strong> : cartouche fermee avec damper independant LSC
          et HSC (version RC2). La version RC n'a que le LSC. Architecture blade valve
          (clapet lame) pour le circuit compression. LSC par needle valve avec 18 clics.
          HSC reglable par une molette externe sur la version RC2 (5 positions).
        </p>
        <p>
          <strong>Charger 2.1</strong> : evolution avec ButterCups — des elements en
          elastomere dans les fourreaux qui filtrent les vibrations haute frequence.
          Meme architecture hydraulique que le Charger 2 mais avec un amortissement
          supplementaire mecanique. Systeme de ressort <strong>DebonAir+</strong> :
          chambre negative agrandie pour ameliorer la sensibilite initiale, joint
          auto-equalisant, systeme Maxima Plush (lubrification speciale).
        </p>
        <p>
          <strong>Charger 3</strong> : derniere generation, architecture revue avec un
          circuit hydraulique plus simple, un nouveau systeme de purge, et une meilleure
          gestion du flux d'huile a haute vitesse. Compatible avec le systeme Flight
          Attendant (amortissement electronique, si disponible).
        </p>

        <h3>BOS : systeme a double clapetterie independante</h3>
        <p>
          BOS (Villefranche-de-Rouergue, France) utilise une architecture unique : deux
          clapetteries completement independantes, une pour la compression et une pour
          la detente. Chaque circuit a son propre piston, son propre shim stack, et son
          propre reglage. Pas de compromis entre compression et detente.
        </p>
        <p>
          Les fourches <strong>Deville</strong> (35mm, enduro) et <strong>Idylle</strong>
          (38mm, DH) utilisent cette architecture. Avantage : possibilite de tuner
          compression et detente de facon totalement independante, sans interaction
          parasite. Inconvenient : complexite de maintenance superieure.
        </p>

        <h3>MRP Ramp Control / Ribbon</h3>
        <p>
          <strong>Ramp Control</strong> : dispositif aftermarket qui s'installe dans
          la chambre d'air des fourches RockShox pour ajouter un controle precis de
          la progressivite en fin de course. Agit comme un token variable avec un
          reglage externe.
        </p>
        <p>
          <strong>Ribbon Coil</strong> : fourche MRP avec cartouche custom et ressort
          helicoidal. La cartouche Ribbon utilise un systeme de valve proprietaire
          avec un reglage de rampe (ramp) qui permet de moduler la progressivite de
          l'amortissement en fin de course.
        </p>

        <h3>Ohlins RXF / TTX</h3>
        <p>
          Ohlins transfere sa technologie moto au VTT. La <strong>RXF 36 m.2</strong>
          et <strong>RXF 38 m.2</strong> utilisent des cartouches pressurisees derivees
          de la technologie TTX (Twin Tube Xplore). 4-way adjustable avec des plages
          de reglage etendues. Shim stacks plus raides que la concurrence (heritage moto),
          seuils LSC/HSC plus eleves.
        </p>
        <p>
          L'architecture twin-tube utilise un tube interne et un tube externe : l'huile
          circule dans un sens dans le tube interne et revient par l'espace annulaire
          entre les deux tubes. Avantage : volume d'huile superieur, meilleure gestion
          thermique, amortissement plus consistant.
        </p>

        <h3>Manitou Mezzer</h3>
        <p>
          La Mezzer (Pro et Expert) utilise le systeme <strong>IRT</strong> (Infinite
          Rate Tune) : deux chambres d'air independantes avec reglage de pression
          distinct. La chambre principale (positive) supporte le poids du pilote.
          La chambre IRT controle la progressivite de fin de course independamment.
          Cela permet un reglage beaucoup plus precis du profil de ressort pneumatique
          que les tokens/spacers.
        </p>
        <p>
          La cartouche <strong>MC2</strong> de Manitou offre un reglage compression/detente
          avec deux circuits semi-independants. L'architecture est differente de Fox et
          RockShox : le ressort et l'amortissement sont du meme cote de la fourche.
        </p>
      </section>
    </article>
  );
}
