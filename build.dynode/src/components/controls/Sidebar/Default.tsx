import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Editor", to: "/Editor" },
  { label: "Help", to: "/Help" },
  { label: "Settings", to: "/Settings" },
];

const Sidebar: React.FC<{ userInitial: string }> = ({ userInitial }) => {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar__user">
        <div className="sidebar__avatar">{userInitial}</div>
        <div className="sidebar__name">Erick</div>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={location.pathname === item.to ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar__bottom">
        <div className="sidebar__link">Documentation</div>
        <div className="sidebar__link">Support</div>
        <div className="sidebar__logo">Project DYNODE</div>
      </div>
    </aside>
  );
};

export default Sidebar;
