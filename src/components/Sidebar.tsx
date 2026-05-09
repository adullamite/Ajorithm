import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MaterialIcon from "./MaterialIcon";

const navItems = [
  { label: "Home", icon: "home", path: "/" },
  { label: "Create Pact", icon: "add_circle", path: "/create" },
  { label: "Profile", icon: "person", path: "/profile" },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] flex-col bg-surface-container/60 backdrop-blur-xl border-r border-outline-variant/20 z-40">
      {/* Logo */}
      <div className="p-6 pb-2">
        <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center neon-glow group-hover:neon-glow-strong transition-all duration-300">
            <MaterialIcon name="hub" size={22} className="text-neon" filled />
          </div>
          <div>
            <h1 className="font-display text-xl text-on-surface tracking-tight">Ajorithm</h1>
            <p className="text-[10px] font-label text-outline uppercase">Devnet</p>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-300
                    ${isActive
                      ? "bg-neon/10 text-neon neon-glow"
                      : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
                    }
                  `}
                >
                  <MaterialIcon name={item.icon} size={22} filled={isActive} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6">
        <div className="glass-card-static p-4 text-center">
          <p className="text-xs text-on-surface-variant">Built on</p>
          <p className="text-sm font-medium text-ajo-primary mt-1">Solana Devnet</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
