import { Link } from "react-router-dom";
import {
  Wrench,
  CircleDot,
  BarChart3,
  Layers,
  AlertTriangle,
  Calculator
} from "lucide-react";

const links = [
  { to: "/hydraulique-fourches", label: "Hydraulique des fourches", desc: "Architecture, circuits compression & detente, specificites par marque", icon: Wrench },
  { to: "/hydraulique-amortisseurs", label: "Hydraulique des amortisseurs", desc: "Mono-tube, piggyback, concepts avances, specificites par marque", icon: CircleDot },
  { to: "/types-amortissement", label: "Types d'amortissement", desc: "Lineaire, digressif, progressif, technologies de valve, plages de vitesse", icon: BarChart3 },
  { to: "/clapetteries", label: "Modification des clapetteries", desc: "Anatomie, principes de modification, formules, pratique atelier", icon: Layers },
  { to: "/troubleshooting", label: "Troubleshooting", desc: "Diagnostic structure : symptome, causes, solutions", icon: AlertTriangle },
  { to: "/calculatrice", label: "Calculatrice suspension", desc: "SAG, shim stack, diagnostic interactif, export Excel", icon: Calculator },
];

export default function Accueil() {
  return (
    <article className="page-content" data-testid="accueil-page">
      <h1>Chatel c'est bien rose</h1>
      <p className="page-subtitle">
        Ressource technique independante pour la preparation suspension VTT DH & Enduro
      </p>

      <section style={{ marginBottom: "40px" }}>
        <p>
          Ce site est une reference technique destinee aux <strong>mecaniciens suspension</strong>,{" "}
          <strong>techniciens cycle</strong> et <strong>pilotes experts</strong> qui travaillent
          sur la preparation des suspensions VTT en Descente (DH) et Enduro.
        </p>
        <p>
          Ici, pas de vulgarisation grand public ni de marketing produit. On couvre le fonctionnement
          hydraulique des fourches et amortisseurs, la theorie et la pratique des clapetteries (shim stacks),
          les types d'amortissement, le diagnostic de problemes, et des calculateurs techniques fonctionnels
          avec export Excel.
        </p>
        <p>
          Les informations sont basees sur des sources techniques reconnues : Peter Verdone Designs,
          Shim ReStackor, Avalanche Downhill Racing, documentation constructeurs (Fox, RockShox, BOS,
          Ohlins, EXT, Cane Creek), et l'experience terrain.
        </p>
      </section>

      <h2 style={{ marginTop: "0" }}>Navigation rapide</h2>
      <div className="quick-links" data-testid="quick-links">
        {links.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="quick-link" data-testid={`link-${to.slice(1)}`}>
            <Icon size={20} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
