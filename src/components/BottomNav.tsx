import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MaterialIcon from "./MaterialIcon";

const navItems = [
  { label: "Home", icon: "home", path: "/" },
  { label: "Create", icon: "add_circle", path: "/create" },
  { label: "Profile", icon: "person", path: "/profile" },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant/20 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                transition-all duration-300
                ${isActive ? "text-neon" : "text-on-surface-variant"}
              `}
            >
              <MaterialIcon name={item.icon} size={24} filled={isActive} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-neon mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
