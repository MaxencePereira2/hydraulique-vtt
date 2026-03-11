import { useState } from "react";
import { ChevronDown } from "lucide-react";

const symptoms = [
  {
    id: "dur-debut",
    symptom: "Fourche/amortisseur trop dur en debut de course",
    causes: [
      "Pression d'air trop elevee",
      "Stiction joints (lubrification insuffisante, joints uses)",
      "Huile trop visqueuse",
      "LSC trop eleve",
      "Volume negatif insuffisant (fourche air)"
    ],
    solutions: [
      "Reduire la pression d'air de 5-10 psi par palier et retester",
      "Lubrifier les joints : deposer quelques gouttes d'huile de fourche (5wt) sur les plongeurs, cycler 20 fois, essuyer",
      "Passer a une huile moins visqueuse (ex: de 7wt a 5wt cote compression)",
      "Ouvrir le reglage LSC de 2-3 clics et retester",
      "Verifier l'equalisation des chambres positive/negative. Sur les Fox, retirer un token. Sur RockShox DebonAir+, verifier la procedure d'equalisation constructeur"
    ],
    detail: "La durete en debut de course (premier tiers du debattement) est le symptome le plus courant. Il resulte generalement d'un desequilibre entre la force de ressort (pression d'air ou spring rate) et la resistance hydraulique basse vitesse. La stiction (friction statique des joints) est souvent sous-estimee : des joints secs ou uses peuvent ajouter 10-15 N de resistance au breakaway. Sur les fourches air, le rapport volume positif / volume negatif influence directement la sensibilite initiale."
  },
  {
    id: "bottom-out",
    symptom: "Bottom-out (tape en fin de course)",
    causes: [
      "HSC trop faible (shim stack compression trop souple)",
      "Pas assez de tokens/spacers (manque de progressivite air)",
      "Pression d'air trop basse",
      "Spring rate trop bas (coil)",
      "Leverage ratio tres progressif sans correction de damping"
    ],
    solutions: [
      "Augmenter le HSC : ajouter des backup shims en fond de stack (ex: 1x 25x0.15 en fond), ou fermer le reglage HSC externe",
      "Ajouter des tokens/spacers : chaque token reduit le volume de la chambre positive, augmentant la progressivite en fin de course. 1 token = ~10% de progressivite supplementaire",
      "Augmenter la pression d'air de 5-10 psi",
      "Monter un ressort plus dur de 25-50 lbs/in",
      "Installer un bottom-out bumper plus epais ou un hydraulic bottom-out (Fox, EXT)"
    ],
    detail: "Le bottom-out survient quand la suspension atteint la fin de sa course mecanique sous impact. C'est un probleme de progression insuffisante de la force de rappel (ressort) ou de damping haute vitesse insuffisant. Sur les cadres a leverage ratio tres progressif (ex: certains Specialized, Santa Cruz), l'amortisseur voit une vitesse de tige reduite en fin de course, ce qui peut masquer un manque de HSC. L'ajout de tokens modifie la courbe de progressivite du ressort pneumatique, pas le damping."
  },
  {
    id: "packing",
    symptom: "Packing (suspension enfoncee, ne revient pas)",
    causes: [
      "LSR trop lent (trop d'amortissement detente)",
      "HSR trop lent",
      "Cavitation (pression IFP/azote trop basse)",
      "Huile degradee (viscosite effondree a chaud)",
      "Pression d'air insuffisante"
    ],
    solutions: [
      "Accelerer la detente : ouvrir le LSR de 3-5 clics. Le rebound doit etre assez rapide pour que la suspension revienne a son SAG entre deux impacts",
      "Verifier et regonfler la pression d'azote de l'IFP : Fox DHX2 = 200 psi, RockShox Super Deluxe = 200 psi, verifier la spec constructeur",
      "Vidanger et remplacer l'huile. Apres 50-80h d'utilisation, l'huile perd ses proprietes. En DH race, vidange toutes les 30-40h",
      "Augmenter la pression d'air de 5-10 psi ou passer au spring rate superieur"
    ],
    detail: "Le packing est un probleme critique en DH et enduro. La suspension s'enfonce progressivement dans son debattement sans revenir a la position de SAG, reduisant le debattement disponible pour les impacts suivants. C'est une boucle : chaque impact successive enfonce la suspension un peu plus. Les causes principales sont un rebound trop lent (la suspension n'a pas le temps de revenir entre deux impacts) ou une cavitation (l'IFP ne maintient pas la pression, de l'air entre dans le circuit d'huile). La cavitation est insidieuse car elle degrade l'amortissement de facon non-lineaire."
  },
  {
    id: "rebond-rapide",
    symptom: "Rebond trop rapide (kick-back, rejet)",
    causes: [
      "LSR trop rapide (pas assez d'amortissement detente)",
      "HSR trop rapide",
      "Pression d'air trop elevee (sur-resort)",
      "Spring rate trop eleve"
    ],
    solutions: [
      "Fermer le LSR de 2-3 clics. Le rebound correct : la suspension revient a sa position de SAG en ~1 seconde sans oscillation",
      "Ajouter des shims cote detente : ex. 1x 30x0.10 en face shim pour augmenter la resistance basse vitesse",
      "Baisser la pression d'air de 5-10 psi",
      "Passer a un ressort plus souple (spring rate inferieur de 25 lbs/in)"
    ],
    detail: "Un rebound trop rapide projette le pilote hors de la selle sur les successions d'impacts (racines, pierriers). La suspension \"renvoie\" l'energie stockee trop vite, creant un kick-back desagreable et dangereux. En DH, c'est particulierement critique dans les sections rapides avec des enchainements d'impacts a haute frequence. Le test classique : comprimer la fourche a fond et relacher — elle doit revenir de facon controlee, sans rebondir au-dela de la position de SAG."
  },
  {
    id: "claquement",
    symptom: "Bruit de claquement (clunk) en compression",
    causes: [
      "Cavitation dans le circuit hydraulique",
      "Bottom-out mecanique (butee interne)",
      "Jeu dans les bagues de montage (DU bushing)",
      "IFP qui tape en fond de reservoir"
    ],
    solutions: [
      "Augmenter la pression d'azote IFP de 25-50 psi",
      "Installer un bottom-out spacer/bumper plus epais",
      "Remplacer les bagues DU du montage (jeu > 0.1mm = remplacement)",
      "Verifier le positionnement et la course de l'IFP (doit avoir 2-3mm de marge en fin de course)"
    ],
    detail: "Les bruits de claquement en compression indiquent un contact metal-metal ou une cavitation severe. La cavitation se produit quand la pression dans la chambre d'huile chute en dessous de la pression de vapeur — des bulles d'air se forment puis implosent, creant un bruit caracteristique. C'est destructeur pour les joints et les surfaces de glissement. Un IFP sous-gonfle est la cause la plus frequente : sans pression d'azote suffisante, le piston flottant ne compense pas le deplacement volumetrique de la tige."
  },
  {
    id: "succion",
    symptom: "Bruit de succion / gurgling",
    causes: [
      "Air dans le circuit d'huile",
      "Niveau d'huile insuffisant",
      "Joints de cartouche defectueux",
      "Purge incomplete apres service"
    ],
    solutions: [
      "Purger integralement le circuit : retourner la fourche/amortisseur, cycler lentement, evacuer toutes les bulles",
      "Completer le niveau d'huile (verifier la spec constructeur : ex. Fox 36 = 150cc cote amortissement, verifier le bath oil level)",
      "Remplacer les joints de cartouche (o-rings, quad-rings)",
      "Refaire la procedure de purge constructeur a la lettre, avec seringue et poche a vide si disponible"
    ],
    detail: "Le bruit de succion (\"glou-glou\") indique la presence d'air dans le circuit hydraulique ferme. L'air est compressible, contrairement a l'huile. Quand de l'air est present, l'amortissement devient inconsistant : la force d'amortissement varie de facon aleatoire. Les causes courantes sont un niveau d'huile insuffisant (le piston aspire de l'air a chaque course) ou une purge incomplete apres un service. Sur les cartouches fermees (Fox GRIP2, RockShox Charger), la purge est critique — une seule bulle de 2mm peut affecter le comportement."
  },
  {
    id: "fade-thermique",
    symptom: "Fade thermique (perte de sensibilite a chaud)",
    causes: [
      "Huile degradee (heures de service depassees)",
      "Viscosite trop basse a chaud",
      "Volume d'huile insuffisant (petit reservoir)",
      "Fonctionnement prolonge a haute intensite"
    ],
    solutions: [
      "Vidanger avec huile neuve. Frequence recommandee : 40-50h en DH, 80-100h en enduro",
      "Passer a une huile de viscosite superieure : de 2.5wt a 5wt, ou de 5wt a 7wt. L'indice de viscosite (VI) est important — les huiles a haut VI (Maxima Plush, Motorex) restent stables en temperature",
      "Envisager un amortisseur piggyback (volume d'huile superieur = meilleure dissipation thermique). Le reservoir externe augmente la capacite thermique de 30-50%",
      "Reduire l'intensite des sessions ou augmenter les temps de pause entre runs"
    ],
    detail: "Le fade thermique est la perte progressive d'amortissement due a l'echauffement de l'huile. Quand l'huile chauffe, sa viscosite diminue — et avec elle, la force d'amortissement. Sur une descente DH de 5 minutes, la temperature interne peut monter de 40-60 degC. L'huile minerale standard perd environ 5% de viscosite par 10 degC. Les amortisseurs piggyback (Fox Float X2, RockShox Super Deluxe) resistent mieux au fade grace a leur volume d'huile superieur et la surface de dissipation du reservoir externe."
  },
  {
    id: "asymetrique",
    symptom: "Comportement asymetrique (change avec la vitesse de maniere incoherente)",
    causes: [
      "Shim pliee ou fissuree dans le stack",
      "Joint partiellement extrude",
      "Clapet bloque en position ouverte ou fermee",
      "Port de piston partiellement obstructe"
    ],
    solutions: [
      "Demonter et inspecter chaque shim : controle planeite sur un marbre ou une surface de reference. Une shim pliee > 0.05mm est a remplacer",
      "Remplacer tous les joints (o-rings, quad-rings, backup rings) par des pieces neuves aux dimensions exactes",
      "Nettoyer ou remplacer la valve. Verifier que le clapet se deplace librement sur sa tige",
      "Nettoyer les ports au solvant (isopropanol) et air comprime. Inspecter les aretes des ports au microscope ou loupe 10x"
    ],
    detail: "Un comportement asymetrique (la suspension reagit differemment a des impacts de meme amplitude) indique un probleme mecanique interne. Contrairement aux problemes de reglage (qui sont reproductibles), les defauts mecaniques creent un comportement aleatoire. Une shim fissuree peut flechir correctement dans un sens mais se bloquer dans l'autre. Un joint partiellement extrude peut creer un bypass variable selon la vitesse et la position du piston. Le diagnostic requiert un demontage complet et une inspection minutieuse de chaque composant."
  },
  {
    id: "descend-repos",
    symptom: "Fourche qui descend toute seule au repos",
    causes: [
      "Joint de tige use (fuite de la chambre positive)",
      "Cartouche non etanche",
      "Pression du volume negatif superieure au positif (desequilibre apres service)"
    ],
    solutions: [
      "Remplacer les joints de tige et racleurs (dust seals + wiper seals). Utiliser des joints OEM ou equivalents certifies (SKF, Enduro)",
      "Verifier l'etancheite de la cartouche : immerger dans l'huile et pressuriser, observer les bulles",
      "Refaire la procedure d'equalisation des chambres : sur Fox, cycler la fourche 20 fois apres avoir atteint la pression cible. Sur RockShox DebonAir+, suivre la procedure specifique (compression lente, equalisation par la valve)"
    ],
    detail: "Une fourche qui s'enfonce au repos (sans pilote) indique un transfert d'air de la chambre positive vers la chambre negative, ou une fuite de la chambre positive vers l'exterieur. Les joints de tige sont les premiers suspects — ils s'usent avec le temps et la poussiere. Sur les systemes DebonAir+ de RockShox, un desequilibre positif/negatif apres service est courant si la procedure d'equalisation n'est pas respectee exactement."
  },
  {
    id: "pop-debattement",
    symptom: "Amortisseur qui fait un 'pop' au debattement",
    causes: [
      "Cavitation de l'IFP",
      "Pression d'azote trop basse",
      "Air piege dans la chambre d'huile",
      "Bottom-out suivi d'une depression"
    ],
    solutions: [
      "Regonfler l'azote a la spec constructeur : Fox Float X2 = 200 psi, RockShox Super Deluxe = 200 psi, BOS Stoy = 150 psi (verifier la spec exacte du modele)",
      "Purger l'air du circuit d'huile par la procedure constructeur",
      "Verifier l'etat de l'IFP : joints uses, rayures sur le tube, position incorrecte"
    ],
    detail: "Le 'pop' au debattement est cause par une depression rapide dans la chambre d'huile. Quand la tige se retracte rapidement apres un bottom-out, le volume d'huile cote compression chute brusquement. Si la pression d'azote de l'IFP est insuffisante, le piston flottant ne suit pas — une cavitation se produit, creant une bulle de vide qui implose avec un bruit caracteristique. C'est un signe avant-coureur d'une degradation plus severe de l'amortissement."
  }
];

export default function Troubleshooting() {
  const [openSymptoms, setOpenSymptoms] = useState({});

  const toggle = (id) => {
    setOpenSymptoms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <article className="page-content" data-testid="troubleshooting-page">
      <h1>Troubleshooting</h1>
      <p className="page-subtitle">
        Guide de diagnostic structure : Symptome &rarr; Causes possibles &rarr; Diagnostic &rarr; Solution
      </p>

      {/* TOC */}
      <nav className="toc">
        <h2>Symptomes</h2>
        <ul>
          {symptoms.map(s => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.symptom}</a>
            </li>
          ))}
        </ul>
      </nav>

      <p>
        Ce guide couvre les 10 symptomes les plus courants en suspension VTT DH et enduro.
        Pour chaque symptome, les causes sont classees par probabilite decroissante et les
        solutions sont ordonnees du plus simple (reglage externe) au plus complexe (intervention
        interne). Toujours commencer par les reglages externes avant de demonter.
      </p>

      {/* Symptoms */}
      {symptoms.map(s => (
        <section key={s.id} id={s.id} className="symptom-card" data-testid={`symptom-${s.id}`}>
          <div className="symptom-header" onClick={() => toggle(s.id)}>
            <h3>{s.symptom}</h3>
            <ChevronDown
              size={18}
              className={`chevron ${openSymptoms[s.id] ? "open" : ""}`}
            />
          </div>

          {openSymptoms[s.id] && (
            <div className="symptom-body">
              {/* Explication */}
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {s.detail}
              </p>

              {/* Causes */}
              <h4 style={{ color: "var(--warning)", marginTop: "0" }}>Causes possibles</h4>
              <ol className="cause-list">
                {s.causes.map((c, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    <span className={`cause-tag ${i < 2 ? "probable" : "possible"}`}>
                      {i < 2 ? "probable" : "possible"}
                    </span>{" "}
                    {c}
                  </li>
                ))}
              </ol>

              {/* Solutions */}
              <h4 style={{ color: "var(--success)" }}>Solutions</h4>
              <ol className="solution-list">
                {s.solutions.map((sol, i) => (
                  <li key={i} style={{ marginBottom: "8px" }}>{sol}</li>
                ))}
              </ol>
            </div>
          )}
        </section>
      ))}

      <section style={{ marginTop: "48px" }}>
        <h2 id="methodo">Methodologie de diagnostic</h2>
        <p>
          Avant de demonter quoi que ce soit, suivre cette procedure systematique :
        </p>
        <ol>
          <li>
            <strong>Verification visuelle</strong> : fuites d'huile, etat des joints, jeu
            dans les montages (bagues, roulements d'oeillet), etat des plongeurs (rayures,
            corrosion).
          </li>
          <li>
            <strong>Verification des pressions</strong> : pression d'air fourche/amortisseur
            (pompe haute pression), pression d'azote IFP (manometre azote). Les pressions
            chutent naturellement avec le temps — verifier toutes les 2-3 sorties.
          </li>
          <li>
            <strong>Test de reglages extremes</strong> : mettre tous les reglages externes
            a fond ouvert, puis a fond ferme. Si le comportement ne change pas, le probleme
            est interne (clapet bloque, port obstructe, huile degradee).
          </li>
          <li>
            <strong>Test de SAG</strong> : mesurer le SAG statique (pourcentage d'enfoncement
            sous le poids du pilote en position d'attaque). Si le SAG est hors plage (cf.
            calculatrice), corriger la pression/ressort avant tout autre reglage.
          </li>
          <li>
            <strong>Isolation du probleme</strong> : identifier si le probleme est en
            compression ou en detente, en basse vitesse ou haute vitesse, en debut ou fin
            de course. Cela oriente directement vers le circuit et le composant concernes.
          </li>
        </ol>
      </section>
    </article>
  );
}
