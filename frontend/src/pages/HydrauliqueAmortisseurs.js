export default function HydrauliqueAmortisseurs() {
  return (
    <article className="page-content" data-testid="hydraulique-amortisseurs-page">
      <h1>Hydraulique des amortisseurs</h1>
      <p className="page-subtitle">
        Rappel complet et exhaustif du fonctionnement hydraulique des amortisseurs VTT
      </p>

      <nav className="toc">
        <h2>Sommaire</h2>
        <ul>
          <li><a href="#archi-amort">Architecture generale d'un amortisseur VTT</a></li>
          <li><a href="#comp-amort">Circuit de compression</a></li>
          <li><a href="#det-amort">Circuit de detente</a></li>
          <li><a href="#concepts">Concepts avances</a></li>
          <li><a href="#marques-amort">Specificites par marque</a></li>
        </ul>
      </nav>

      {/* =============================================
          SECTION 1 : Architecture generale
          ============================================= */}
      <section id="archi-amort">
        <h2>Architecture generale d'un amortisseur VTT</h2>

        <h3>Mono-tube vs twin-tube (piggyback)</h3>
        <p>
          L'amortisseur <strong>mono-tube</strong> est le design le plus simple : un seul cylindre
          contenant le piston, l'huile et l'IFP. Le piston se deplace dans un tube unique. Avantages :
          compacite, legerete, simplicite. Inconvenients : volume d'huile limite, sensibilite au
          fade thermique, l'IFP doit etre dans le meme tube que le piston (contrainte de packaging).
        </p>
        <p>
          L'amortisseur <strong>twin-tube</strong> ou <strong>piggyback</strong> ajoute un reservoir
          externe connecte au corps principal. Ce reservoir contient une base valve deportee et un
          volume d'huile supplementaire. L'IFP est deplace dans le reservoir, liberant de l'espace
          dans le tube principal. Avantages : volume d'huile superieur (+30-50%), meilleure dissipation
          thermique, base valve deportee permettant un circuit de compression separe et plus
          sophistique. C'est le standard pour le DH et l'enduro race.
        </p>

        {/* SVG : amortisseur mono-tube air */}
        <div className="svg-container">
          <svg viewBox="0 0 400 280" width="400" height="280" data-testid="svg-monotube-air">
            {/* Cylindre */}
            <rect x="120" y="40" width="160" height="200" rx="8" fill="#1f1f30" stroke="#3a3a4e" strokeWidth="2" />
            {/* Tige */}
            <rect x="190" y="10" width="20" height="80" fill="#4a4a5e" rx="2" />
            {/* Piston */}
            <rect x="130" y="88" width="140" height="10" fill="#ff1493" rx="2" />
            {/* Ports piston */}
            <rect x="155" y="90" width="6" height="6" fill="#12121f" />
            <rect x="195" y="90" width="6" height="6" fill="#12121f" />
            <rect x="240" y="90" width="6" height="6" fill="#12121f" />
            {/* Shim stack */}
            <rect x="140" y="100" width="120" height="2" fill="#e91e8c" />
            <rect x="150" y="103" width="100" height="2" fill="#e91e8c" />
            {/* Air sleeve (around body) */}
            <rect x="105" y="35" width="190" height="210" rx="12" fill="none" stroke="rgba(0,150,255,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
            {/* IFP */}
            <rect x="130" y="180" width="140" height="8" fill="#ffaa00" rx="3" />
            {/* Nitrogen */}
            <rect x="130" y="190" width="140" height="44" rx="0 0 6 6" fill="rgba(255,170,0,0.08)" />
            {/* Eye mount top */}
            <circle cx="200" cy="10" r="6" fill="none" stroke="#5a5a6e" strokeWidth="2" />
            {/* Eye mount bottom */}
            <circle cx="200" cy="248" r="6" fill="none" stroke="#5a5a6e" strokeWidth="2" />
            {/* Labels */}
            <text x="90" y="55" textAnchor="end" fill="rgba(0,150,255,0.5)" fontSize="10" fontFamily="JetBrains Mono">Air sleeve</text>
            <text x="90" y="95" textAnchor="end" fill="#ff1493" fontSize="10" fontFamily="JetBrains Mono">Piston</text>
            <text x="310" y="106" textAnchor="start" fill="#e91e8c" fontSize="10" fontFamily="JetBrains Mono">Shim stack</text>
            <text x="310" y="186" textAnchor="start" fill="#ffaa00" fontSize="10" fontFamily="JetBrains Mono">IFP</text>
            <text x="200" y="218" textAnchor="middle" fill="rgba(255,170,0,0.5)" fontSize="10" fontFamily="JetBrains Mono">N2 (200 psi)</text>
            <text x="200" y="70" textAnchor="middle" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Huile</text>
            <text x="90" y="22" textAnchor="end" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Tige</text>
          </svg>
          <p className="svg-caption">Coupe d'un amortisseur mono-tube air. Le piston separe les deux chambres d'huile. L'IFP compense le volume de la tige avec de l'azote pressurise.</p>
        </div>

        <h3>IFP (Internal Floating Piston)</h3>
        <p>
          L'IFP est un piston libre qui separe l'huile de l'azote dans le cylindre. Son role est
          de <strong>compenser le deplacement volumetrique de la tige</strong>. Quand la tige entre
          dans le cylindre (compression), elle occupe du volume. L'huile etant incompressible, ce
          volume doit etre compense — l'IFP recule et comprime l'azote.
        </p>
        <p>
          La pression d'azote derriere l'IFP est typiquement de <strong>150 a 250 psi</strong>
          selon le modele. Cette pression a trois effets importants :
        </p>
        <ul>
          <li><strong>Prevention de la cavitation</strong> : la pression maintient l'huile au-dessus de sa pression de vapeur, empechant la formation de bulles d'air</li>
          <li><strong>Bottom-out hydraulique</strong> : en fin de course, le volume d'azote est fortement comprime, creant une resistance progressive additionnelle</li>
          <li><strong>Compensation de la dilatation thermique</strong> : quand l'huile chauffe et se dilate, l'IFP absorbe le changement de volume</li>
        </ul>

        <h3>Piggyback / reservoir externe</h3>
        <p>
          Le reservoir externe (piggyback) est un cylindre additionnel connecte au corps principal
          par un conduit. Il contient la <strong>base valve</strong> (valve de compression deportee)
          et l'IFP. Cette architecture offre plusieurs avantages :
        </p>
        <ul>
          <li><strong>Volume d'huile superieur</strong> : 30-50% de plus qu'un mono-tube de meme course. Plus d'huile = meilleure capacite thermique</li>
          <li><strong>Base valve deportee</strong> : le circuit de compression dans le reservoir est physiquement separe du circuit de detente dans le corps. Permet un tuning plus independant</li>
          <li><strong>IFP hors du tube principal</strong> : le piston n'est limite que par la course mecanique, pas par la position de l'IFP</li>
          <li><strong>Dissipation thermique</strong> : surface d'echange superieure grace au reservoir</li>
        </ul>

        {/* SVG : amortisseur piggyback coil */}
        <div className="svg-container">
          <svg viewBox="0 0 480 280" width="480" height="280" data-testid="svg-piggyback-coil">
            {/* Corps principal */}
            <rect x="60" y="40" width="150" height="200" rx="8" fill="#1f1f30" stroke="#3a3a4e" strokeWidth="2" />
            {/* Tige */}
            <rect x="125" y="10" width="20" height="60" fill="#4a4a5e" rx="2" />
            <circle cx="135" cy="10" r="6" fill="none" stroke="#5a5a6e" strokeWidth="2" />
            {/* Piston */}
            <rect x="70" y="80" width="130" height="10" fill="#ff1493" rx="2" />
            {/* Shim stacks (comp et rebound) */}
            <rect x="80" y="92" width="110" height="2" fill="#e91e8c" />
            <rect x="80" y="76" width="110" height="2" fill="#00cc88" />
            {/* Coil spring */}
            <path d="M 48 50 Q 25 60, 48 70 Q 72 80, 48 90 Q 25 100, 48 110 Q 72 120, 48 130 Q 25 140, 48 150 Q 72 160, 48 170 Q 25 180, 48 190 Q 72 200, 48 210" fill="none" stroke="#6a6a7e" strokeWidth="3" />
            {/* Reservoir piggyback */}
            <rect x="300" y="50" width="80" height="180" rx="8" fill="#1f1f30" stroke="#3a3a4e" strokeWidth="2" />
            {/* Conduit */}
            <path d="M 210 140 L 300 140" fill="none" stroke="#3a3a4e" strokeWidth="2" />
            <path d="M 210 140 L 300 140" fill="none" stroke="#ff1493" strokeWidth="1" strokeDasharray="4 3" />
            {/* Base valve dans reservoir */}
            <rect x="310" y="120" width="60" height="8" fill="#ff1493" rx="2" />
            <rect x="315" y="129" width="50" height="2" fill="#e91e8c" />
            <rect x="320" y="132" width="40" height="2" fill="#e91e8c" />
            {/* IFP dans reservoir */}
            <rect x="310" y="175" width="60" height="8" fill="#ffaa00" rx="3" />
            {/* N2 */}
            <rect x="310" y="185" width="60" height="40" fill="rgba(255,170,0,0.08)" />
            {/* Oil */}
            <rect x="310" y="55" width="60" height="63" fill="rgba(0,150,255,0.05)" />
            {/* Eye bottom */}
            <circle cx="135" cy="248" r="6" fill="none" stroke="#5a5a6e" strokeWidth="2" />
            {/* Labels */}
            <text x="135" y="165" textAnchor="middle" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Corps principal</text>
            <text x="340" y="45" textAnchor="middle" fill="#a0a0b0" fontSize="10" fontFamily="system-ui">Reservoir</text>
            <text x="400" y="128" textAnchor="start" fill="#ff1493" fontSize="9" fontFamily="JetBrains Mono">Base valve</text>
            <text x="400" y="181" textAnchor="start" fill="#ffaa00" fontSize="9" fontFamily="JetBrains Mono">IFP</text>
            <text x="340" y="213" textAnchor="middle" fill="rgba(255,170,0,0.5)" fontSize="9" fontFamily="JetBrains Mono">N2</text>
            <text x="255" y="135" textAnchor="middle" fill="#ff1493" fontSize="9" fontFamily="JetBrains Mono">Conduit</text>
            <text x="12" y="130" textAnchor="start" fill="#6a6a7e" fontSize="9" fontFamily="JetBrains Mono">Coil</text>
            <text x="135" y="88" textAnchor="middle" fill="#ff1493" fontSize="9" fontFamily="JetBrains Mono">Piston</text>
          </svg>
          <p className="svg-caption">Coupe d'un amortisseur piggyback coil. La base valve est deportee dans le reservoir. L'IFP et l'azote sont dans le reservoir.</p>
        </div>

        <h3>Ressort a air</h3>
        <p>
          Le ressort a air utilise un <strong>air sleeve</strong> (manchon d'air) autour du corps
          de l'amortisseur. L'air comprime dans le volume positif supporte le poids du pilote.
          Comme pour les fourches, le comportement est <strong>progressif</strong> : la force
          augmente de facon exponentielle en fin de course (compression adiabatique du gaz).
        </p>
        <p>
          Les <strong>tokens/spacers</strong> reduisent le volume positif pour augmenter la
          progressivite. Le volume negatif facilite l'initiation du mouvement (sensibilite).
          Sur les Fox Float X2, le systeme EVOL (Extra Volume) utilise un air sleeve agrandi
          pour ameliorer la linearite.
        </p>

        <h3>Ressort helicoidal</h3>
        <p>
          Le ressort helicoidal offre un spring rate <strong>lineaire</strong> : F = k.x. Le
          choix du spring rate depend du poids du pilote, du leverage ratio du cadre et du
          style de pilotage. La conversion : <strong>1 N/mm = 5.71 lbs/in</strong>.
        </p>
        <p>
          Formule de base pour le choix du spring rate coil amortisseur :
        </p>
        <div className="formula-block">
          <div className="formula-name">Spring Rate recommande (coil)</div>
          <div className="formula-expr">SR = (Poids x 9.81) / (Course x SAG%)</div>
          <div className="formula-desc">
            Poids en kg (equipe), Course en metres, SAG% en decimal (0.30 pour 30%).
            Le leverage ratio moyen intervient pour convertir la spring rate roue en spring rate amortisseur.
          </div>
        </div>
        <p>
          Exemple : pilote de 80 kg equipe, course amortisseur 65mm, SAG 30%, leverage ratio
          moyen 2.8. Spring rate = (80 x 9.81) / (0.065 x 0.30) = ~40 250 N/m = ~40.2 N/mm
          au niveau de la roue. Au niveau de l'amortisseur : SR_shock = SR_wheel / LR au carre
          = 40.2 / 7.84 = ~5.13 N/mm = ~29.3 lbs/in. En pratique, on arrondit au spring rate
          disponible le plus proche (les spring rates sont vendus par increments de 25 lbs/in
          en general).
        </p>
      </section>

      {/* =============================================
          SECTION 2 : Circuit de compression
          ============================================= */}
      <section id="comp-amort">
        <h2>Circuit de compression</h2>

        <h3>Piston principal</h3>
        <p>
          Le piston principal de l'amortisseur contient des <strong>ports de compression</strong>
          et des <strong>ports de detente</strong>, chacun couvert par son propre shim stack.
          En compression, l'huile est forcee a travers les ports de compression, flechissant
          les shims correspondants. Les ports de detente sont bloques par les shims de detente
          (qui agissent comme check valves en compression).
        </p>
        <p>
          Le diametre du piston (typiquement 20-25mm sur les amortisseurs VTT) determine la
          force d'amortissement pour une meme pression differentielle. Un piston plus grand
          genere plus de force pour la meme configuration de shim stack (F = dP x A_piston).
        </p>

        <h3>Base valve (piggyback)</h3>
        <p>
          Dans un amortisseur piggyback, la <strong>base valve</strong> est situee entre le corps
          principal et le reservoir. En compression, l'huile est poussee a travers le piston
          principal ET a travers la base valve. Les deux valves travaillent en serie/parallele
          selon l'architecture.
        </p>
        <p>
          La base valve contient son propre shim stack de compression. Sur les amortisseurs
          haut de gamme (Fox Float X2, Cane Creek DBAir), les reglages HSC et LSC agissent
          sur la base valve, pas sur le piston principal. Cela permet de modifier le comportement
          en compression sans affecter la detente.
        </p>

        <h3>Climb switch / lockout</h3>
        <p>
          Le <strong>climb switch</strong> est une valve qui restreint le bypass basse vitesse,
          augmentant drastiquement le LSC pour reduire le pompage au pedalage. En position fermee,
          seul un petit orifice reste ouvert pour eviter le blocage total (blow-off). La plupart
          des climb switches ont 2-3 positions : Open, Pedal (trail), Lock.
        </p>
        <p>
          En position Lock, le LSC est maximal mais un blow-off protege l'amortisseur en cas
          d'impact (la valve s'ouvre brusquement au-dela d'un seuil de pression). Sur les
          cadres a faible anti-squat, le climb switch est indispensable pour le pedalage.
          Sur les cadres a fort anti-squat (certains DW-Link, VPP), il est souvent inutile.
        </p>

        <h3>Reglage LSC et HSC</h3>
        <p>
          <strong>LSC</strong> : needle valve externe, typiquement 10-20 clics. Agit sur le
          bypass basse vitesse. Controle le pompage au pedalage, le transfert de masse,
          l'assiette en virage.
        </p>
        <p>
          <strong>HSC</strong> : Sur les amortisseurs 2-way (Fox DPS, RockShox Deluxe), seul
          le LSC est reglable. Sur les 4-way (Fox Float X2, Cane Creek DBAir IL), le HSC est
          aussi reglable via un clicker externe. Internement, le HSC est determine par le shim
          stack — la modification interne offre une plage de reglage beaucoup plus large que le
          clicker externe.
        </p>
      </section>

      {/* =============================================
          SECTION 3 : Circuit de detente
          ============================================= */}
      <section id="det-amort">
        <h2>Circuit de detente</h2>

        <h3>Shim stack detente cote piston</h3>
        <p>
          Le shim stack de detente est monte de l'autre cote du piston par rapport au stack
          compression. En detente (extension), la force du ressort pousse le piston, forcant
          l'huile a travers les ports de detente et les shims correspondants.
        </p>
        <p>
          Le stack detente est generalement <strong>plus souple</strong> que le stack compression
          car la force motrice est limitee a la force du ressort. Un stack trop raide cote detente
          = la suspension ne revient pas (packing). La balance compression/detente est un des
          parametres les plus critiques du setup.
        </p>

        <h3>Reglage LSR et HSR</h3>
        <p>
          <strong>LSR</strong> : reglage externe par needle valve (clickers). Controle la vitesse
          de retour lent. Le test classique : comprimer l'amortisseur a la main et relacher.
          Retour ideal en 1-1.5 seconde sans oscillation.
        </p>
        <p>
          <strong>HSR</strong> : reglable externement sur les dampers 4-way (Fox Float X2 GRIP2,
          Cane Creek DBAir IL). Sinon, modifiable uniquement par changement du shim stack detente.
          Critique en DH pour eviter le packing dans les sections rapides et techniques.
        </p>

        <h3>Gestion du packing</h3>
        <p>
          Le <strong>packing</strong> survient quand la suspension s'enfonce progressivement sans
          revenir a la position de SAG entre les impacts. C'est un probleme de desequilibre
          entre la vitesse de compression (impacts) et la vitesse de detente (retour).
        </p>
        <p>
          Sur les cadres a leverage ratio fortement degressif (leverage ratio qui diminue en
          fin de course), la vitesse de tige de l'amortisseur augmente en fin de course — ce
          qui favorise le packing car le rebound doit travailler plus dur pour ramener la
          suspension. La solution : accelerer le rebound (ouvrir LSR et/ou modifier le shim
          stack HSR) ou augmenter la force de ressort.
        </p>

        <h3>Cavitation cote detente</h3>
        <p>
          La <strong>cavitation</strong> cote detente se produit quand le piston se deplace plus
          vite que l'huile ne peut suivre. La pression dans la chambre cote tige chute en dessous
          de la pression de vapeur, formant des bulles. Quand ces bulles implosent, elles creent
          des forces d'impact locales qui endommagent les surfaces metalliques.
        </p>
        <p>
          Causes : pression d'azote IFP insuffisante, huile degradee (viscosite trop basse a
          chaud), shim stack detente trop raide (l'huile ne passe pas assez vite). Solution :
          regonfler l'azote, vidanger l'huile, et/ou assouplir le stack detente.
        </p>
      </section>

      {/* =============================================
          SECTION 4 : Concepts avances
          ============================================= */}
      <section id="concepts">
        <h2>Concepts avances</h2>

        <h3>Cavitation</h3>
        <p>
          La cavitation est la formation de bulles de vapeur dans l'huile quand la pression locale
          chute en dessous de la pression de vapeur. En suspension VTT, la cavitation se produit
          principalement cote detente et cote aspiration de la base valve.
        </p>
        <p>
          <strong>Causes</strong> : pression d'azote IFP insuffisante (cause n.1), huile degradee
          dont la viscosite s'est effondree, vitesse de piston excessive (impacts extremes), shim
          stack trop restrictif.
        </p>
        <p>
          <strong>Symptomes</strong> : bruit de claquement ou de succion, amortissement inconsistant,
          sensation de "vide" a certains points de la course.
        </p>
        <p>
          <strong>Solutions</strong> : regonfler l'azote a la spec constructeur (200 psi typique),
          vidanger avec huile neuve, verifier l'etat de l'IFP (joints, liberte de mouvement).
        </p>

        <h3>Fade thermique</h3>
        <p>
          Le fade thermique est la perte d'amortissement due a l'echauffement de l'huile. La
          viscosite de l'huile diminue avec la temperature — et la force d'amortissement est
          directement proportionnelle a la viscosite.
        </p>
        <p>
          Sur une descente DH de 5 minutes, la temperature interne de l'amortisseur peut monter
          de <strong>40 a 60 degC</strong>. L'huile minerale standard perd environ 5% de viscosite
          par 10 degC d'augmentation. Sur un long run d'enduro (~20 min), les pertes peuvent
          atteindre 20-30%.
        </p>
        <p>
          <strong>Solutions</strong> : huile a haut indice de viscosite (VI), volume d'huile
          superieur (piggyback), dissipation thermique (ailettes sur le reservoir), intervalles
          de vidange respectes (40-50h en DH, 80-100h en enduro).
        </p>

        <h3>Hysteresis</h3>
        <p>
          L'<strong>hysteresis</strong> en suspension est la difference de force entre la compression
          et la detente pour une meme position du piston. Elle est causee par :
        </p>
        <ul>
          <li><strong>Frottement des joints</strong> : les joints toriques et racleurs creent une friction statique et dynamique</li>
          <li><strong>Stiction de tige</strong> : la friction statique de la tige dans le joint de tete est la principale source de hysteresis</li>
          <li><strong>Friction de l'IFP</strong> : le piston flottant a ses propres joints qui frottent contre le tube</li>
        </ul>
        <p>
          L'hysteresis reduit la <strong>sensibilite</strong> de la suspension : les petits mouvements
          (vibrations, petites racines) ne depassent pas le seuil de friction statique et ne sont
          pas amortis. Les amortisseurs haut de gamme utilisent des joints a faible friction (PTFE,
          joints racleurs basse friction) et des tolerances serrees pour minimiser l'hysteresis.
        </p>

        <h3>Effet du leverage ratio du cadre</h3>
        <p>
          Le <strong>leverage ratio</strong> (LR) du cadre est le rapport entre la vitesse de la
          roue et la vitesse de la tige de l'amortisseur. Si LR = 3.0, la roue se deplace 3 fois
          plus vite que la tige de l'amortisseur.
        </p>
        <div className="formula-block">
          <div className="formula-name">Conversion vitesse roue / vitesse amortisseur</div>
          <div className="formula-expr">V_shock = V_wheel / LR</div>
          <div className="formula-desc">
            V_wheel = vitesse de deplacement de la roue (mm/s), LR = leverage ratio a la position
            de debattement consideree. Le LR varie en fonction de la position — c'est la courbe
            de leverage ratio (leverage curve).
          </div>
        </div>
        <p>
          Implication : un cadre avec un LR de 3.0 divise la vitesse d'impact par 3 au niveau
          de l'amortisseur. Un impact a 300 mm/s a la roue = 100 mm/s a l'amortisseur. Cela
          signifie que l'amortisseur travaille principalement dans la plage <strong>basse
          vitesse</strong> de son damper, meme lors d'impacts rapides a la roue.
        </p>
        <p>
          C'est pourquoi le reglage LSC est si critique sur les amortisseurs arriere — la
          plupart des sollicitations terrain tombent dans la plage LSC de l'amortisseur, meme
          si elles sont "haute vitesse" au niveau de la roue.
        </p>

        <h3>Volume d'azote et fin de course</h3>
        <p>
          Le volume d'azote derriere l'IFP a un impact direct sur le comportement en fin de
          course. Quand la tige entre profondement dans le cylindre, l'IFP comprime l'azote
          de facon adiabatique. Si le volume initial d'azote est petit, la pression monte
          tres vite en fin de course — creant un <strong>bottom-out hydraulique progressif</strong>.
        </p>
        <p>
          C'est le principe du <strong>bottom-out control</strong> sur les amortisseurs piggyback :
          la position de l'IFP dans le reservoir et la pression initiale d'azote determinent la
          force de bottom-out. Les preparateurs World Cup ajustent la charge d'azote pour
          moduler le bottom-out sans affecter le comportement en milieu de course.
        </p>
      </section>

      {/* =============================================
          SECTION 5 : Specificites par marque
          ============================================= */}
      <section id="marques-amort">
        <h2>Specificites par marque</h2>

        <h3>Fox Float X2 / DHX2</h3>
        <p>
          Le <strong>Float X2</strong> (air) et le <strong>DHX2</strong> (coil) sont les
          amortisseurs phare de Fox pour le DH et l'enduro race. Architecture piggyback,
          GRIP2 damper, <strong>4-way adjustable</strong> (LSC, HSC, LSR, HSR).
        </p>
        <p>
          Technologies cles :
        </p>
        <ul>
          <li><strong>SSD (Sub Speed Damping)</strong> : amortissement additionnel pour les tres basses vitesses de tige (0-10 mm/s). Controle la stabilite de l'assiette et le support en virage. Reglable sur la base valve</li>
          <li><strong>HSB (High Speed Bleed)</strong> : orifice de bypass haute vitesse sur certaines configurations de tuning factory. Adoucit la transition entre LSC et HSC</li>
          <li><strong>EVOL air sleeve</strong> (Float X2 air) : manchon d'air a volume agrandi pour un comportement plus lineaire</li>
        </ul>
        <p>
          Pression d'azote IFP spec : 200 psi (Float X2) / 200 psi (DHX2).
        </p>

        <h3>RockShox Super Deluxe</h3>
        <p>
          Le Super Deluxe est le piggyback de reference RockShox. Disponible en versions Air
          et Coil, avec damper RC, RC2 (2-way) ou Ultimate (meilleure finition).
        </p>
        <p>
          <strong>Maxima Plush</strong> : huile speciale co-developpee avec Maxima, a haut indice
          de viscosite pour une meilleure stabilite thermique. <strong>RCT3</strong> : 3 modes
          (Open, Pedal, Lock) sur le reservoir. Pression d'azote spec : 200 psi.
        </p>
        <p>
          La base valve du Super Deluxe est dans le reservoir piggyback. Le piston principal
          gere la detente, la base valve gere la compression. Architecture classique et fiable.
        </p>

        <h3>BOS Stoy / Kirk / Void</h3>
        <p>
          BOS utilise la meme philosophie de <strong>double clapetterie independante</strong>
          que sur ses fourches. Chaque circuit (compression, detente) a son propre ensemble
          piston + shim stack, physiquement separe. Pas de compromis entre les deux circuits.
        </p>
        <p>
          Le <strong>Kirk</strong> (coil) et le <strong>Void</strong> (air) sont les modeles
          DH. Le <strong>Stoy</strong> est le modele enduro. Fabrication francaise, usinage
          CNC de haute precision. Les shim stacks BOS sont optimises pour les pistes
          francaises et alpines — generalement un peu plus raides que la concurrence.
        </p>

        <h3>Ohlins TTX22m / TTX Air</h3>
        <p>
          Ohlins utilise l'architecture <strong>twin-tube</strong> (TTX = Twin Tube Xplore)
          derivee de la moto. Le tube interne contient le piston, le tube externe cree un
          circuit de retour pour l'huile. La base valve est entre les deux tubes.
        </p>
        <p>
          Avantage du twin-tube : l'huile circule en permanence entre les deux tubes, assurant
          un brassage continu et une meilleure gestion thermique. Les shim stacks Ohlins sont
          heredites de la moto (seuils plus eleves, configurations plus raides). Le TTX22m
          est l'amortisseur DH, le TTX Air est la version air pour l'enduro.
        </p>

        <h3>EXT Storia / Arma</h3>
        <p>
          EXT (Extreme Shox, Italie) est un fabricant boutique reconnu pour l'amortisseur
          <strong>Storia</strong> (coil) et l'<strong>Arma</strong> (air). La technologie
          cle est le <strong>HBC</strong> (Hydraulic Bottom Cup) : un bottom-out hydraulique
          progressif integre au pied de l'amortisseur.
        </p>
        <p>
          Le HBC fonctionne comme une valve additionnelle qui s'active uniquement en fin de
          course. Il cree une force de resistance progressive qui previent le bottom-out mecanique
          sans affecter le comportement en milieu de course. Le reglage HBC est independant du
          reglage de compression principal.
        </p>
        <p>
          EXT est particulierement repute pour la qualite de ses joints (stiction minimale) et
          la linearite de ses profils d'amortissement. Utilise par de nombreux pilotes World Cup
          en prive.
        </p>

        <h3>Cane Creek DB Air / DB Coil</h3>
        <p>
          Cane Creek utilise une architecture <strong>twin-tube</strong> avec <strong>4-way
          independent</strong> : chaque circuit (LSC, HSC, LSR, HSR) est physiquement separe
          avec son propre piston et son propre shim stack. C'est l'architecture la plus
          modulaire du marche.
        </p>
        <p>
          Le <strong>DB (Double Barrel)</strong> Air et Coil offrent 4 reglages externes
          independants. L'architecture twin-tube permet un volume d'huile eleve sans reservoir
          externe visible (le "reservoir" est l'espace annulaire entre les deux tubes). Cane
          Creek fournit une application mobile (CS Tuned) pour guider le setup.
        </p>
        <p>
          Particularite : les reglages Cane Creek ont une plage tres large (certains modeles
          ont 24+ clics par reglage), ce qui donne une resolution fine mais peut etre intimidant
          pour un mecanicien non familier avec la marque.
        </p>
      </section>
    </article>
  );
}
