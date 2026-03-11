import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="site-layout">
      {/* Burger button (mobile) */}
      <button
        className="burger-btn"
        onClick={toggleSidebar}
        data-testid="burger-menu-btn"
        aria-label="Menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
