import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Spin } from "antd";

// Lazy load your pages
const Home = lazy(() => import("./pages/Home/Default"));
const Help = lazy(() => import("./pages/Help/Default"));
const HelpComponents = lazy(() => import("./pages/Help/Components/Default"));
const Editor = lazy(() => import("./pages/Editor/Default"));
const AssetUpload = lazy(() => import("./pages/Editor/Assets/Upload"));

function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
            <Spin size="large" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/components" element={<HelpComponents />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/assets/upload" element={<AssetUpload />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
