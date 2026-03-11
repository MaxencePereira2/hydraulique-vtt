import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Wrench,
  CircleDot,
  BarChart3,
  Layers,
  AlertTriangle,
  Calculator
} from "lucide-react";

const navItems = [
  { path: "/", label: "Accueil", icon: Home },
  { path: "/hydraulique-fourches", label: "Hydraulique fourches", icon: Wrench },
  { path: "/hydraulique-amortisseurs", label: "Hydraulique amortisseurs", icon: CircleDot },
  { path: "/types-amortissement", label: "Types d'amortissement", icon: BarChart3 },
  { path: "/clapetteries", label: "Clapetteries", icon: Layers },
  { path: "/troubleshooting", label: "Troubleshooting", icon: AlertTriangle },
  { path: "/calculatrice", label: "Calculatrice", icon: Calculator },
];

export default function Sidebar({ isOpen, onNavigate }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} data-testid="sidebar">
      {/* Branding */}
      <div className="sidebar-brand">
        <h1 data-testid="sidebar-title">
          Chatel c'est bien rose
        </h1>
        <p>Suspension VTT DH & Enduro</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" data-testid="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onNavigate}
            data-testid={`nav-${path === "/" ? "accueil" : path.slice(1)}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--borders)",
        fontSize: "11px",
        color: "var(--text-muted)",
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <span style={{ color: "var(--pink)" }}>v1.0</span> — Ressource independante
      </div>
    </aside>
  );
}
