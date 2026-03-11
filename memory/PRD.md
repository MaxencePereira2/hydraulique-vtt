# PRD — Châtel c'est bien rose

## Problem Statement
Ressource technique indépendante pour la préparation suspension VTT DH & Enduro. Public expert : mécaniciens suspension, techniciens cycle, pilotes experts. Site 100% statique côté client.

## Architecture
- **Frontend**: React SPA with React Router
- **Backend**: Minimal FastAPI (health check only, no DB)
- **Database**: None — 100% client-side
- **Styling**: Custom CSS dark theme + Tailwind utilities
- **Dependencies**: SheetJS (xlsx) for Excel export, lucide-react for icons

## User Personas
1. Mécanicien suspension VTT professionnel
2. Technicien cycle en atelier
3. Pilote DH/Enduro expert qui travaille sur sa propre suspension

## Core Requirements
- 7 pages de contenu technique exhaustif en français
- Calculateurs interactifs fonctionnels (SAG, shim stack, diagnostic, export Excel)
- SVG inline pour schémas hydrauliques
- Canvas 2D pour courbes Force vs Velocity
- Export Excel via SheetJS
- Sidebar navigation fixe, responsive (burger mobile)
- Dark theme (#1a1a2e), accent rose (#ff1493), monospace JetBrains Mono

## What's Been Implemented (Feb 2026)
- [x] All 7 pages with real technical content
- [x] Sidebar navigation with active state
- [x] Responsive layout (desktop sidebar, mobile burger)
- [x] SVG technical diagrams (fork cross-sections, oil flow schematics)
- [x] Force vs Velocity canvas charts
- [x] Calculator: SAG & pressure module
- [x] Calculator: Shim stack analyzer with visual + F/V chart
- [x] Calculator: Diagnostic by symptoms
- [x] Calculator: Excel export (4 sheets)
- [x] Troubleshooting: 10 symptoms with expandable cards
- [x] Clapetteries: Interactive shim stack module
- [x] All formulas sourced and explained

## Testing Results
- Frontend: 99% pass rate (iteration 1)
- All navigation, interactive elements, calculations verified

## Prioritized Backlog
### P0
- (completed)

### P1
- Add more SVG diagrams (amortisseur piggyback flow, piston+base valve interaction detail)
- Improve shim stack calculator precision (crossover gap modeling)
- Make Excel export include actual shim stack data from calculator tab

### P2
- Add search functionality across pages
- Add print-friendly CSS
- Dark/light theme toggle
- LocalStorage for saving rider data and shim stack configurations
- Add more brand-specific setup guides

## Next Tasks
1. User feedback on content accuracy
2. Deploy to GitHub Pages (static build)
3. Add localStorage for persistent rider data
