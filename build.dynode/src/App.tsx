import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Default";
import JsonEditor from "./pages/Editor/JSONEditor";
import AssetUpload from "./pages/Editor/AssetUpload";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
          <Route path="/editor/json/:id" element={<JsonEditor />} />
          <Route path="/editor/assetupload/" element={<AssetUpload />} />
    </Routes>
  );
}

export default App;
