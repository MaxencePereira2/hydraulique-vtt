import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Accueil from "@/pages/Accueil";
import HydrauliqueFourches from "@/pages/HydrauliqueFourches";
import HydrauliqueAmortisseurs from "@/pages/HydrauliqueAmortisseurs";
import TypesAmortissement from "@/pages/TypesAmortissement";
import Clapetteries from "@/pages/Clapetteries";
import Troubleshooting from "@/pages/Troubleshooting";
import Calculatrice from "@/pages/Calculatrice";

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/hydraulique-fourches" element={<HydrauliqueFourches />} />
          <Route path="/hydraulique-amortisseurs" element={<HydrauliqueAmortisseurs />} />
          <Route path="/types-amortissement" element={<TypesAmortissement />} />
          <Route path="/clapetteries" element={<Clapetteries />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
          <Route path="/calculatrice" element={<Calculatrice />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
