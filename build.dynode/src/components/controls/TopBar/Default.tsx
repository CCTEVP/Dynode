import React from "react";

const TopBar: React.FC<{
  onNewFolder: () => void;
  onSearch: (term: string) => void;
}> = ({ onNewFolder, onSearch }) => {
  return (
    <div className="topbar">
      <span className="topbar__folder">Folder</span>
      <button className="topbar__new-folder" onClick={onNewFolder}>
        + New Folder
      </button>
      <input
        className="topbar__search"
        type="text"
        placeholder="Enter keywords here..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default TopBar;
