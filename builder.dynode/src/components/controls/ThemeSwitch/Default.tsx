import React from "react";
import { Tooltip } from "antd";
import { useTheme } from "../../../contexts/ThemeContext";
import "./Default.css";

const ThemeSwitch: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <Tooltip
      title={`Switch to ${themeMode === "dark" ? "Light" : "Dark"} Mode`}
      placement="left"
    >
      <button
        onClick={toggleTheme}
        className="theme-toggle-corner"
        data-mode={themeMode}
        aria-label="Toggle theme"
      >
        <span className="theme-toggle-track" />
        <span className="theme-toggle-knob">
          <span className="theme-toggle-icon">
            {themeMode === "dark" ? "🌙" : "☀️"}
          </span>
        </span>
      </button>
    </Tooltip>
  );
};

export default ThemeSwitch;
