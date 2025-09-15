import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Spin, App as AntApp } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/controls/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Lazy load your pages
const Home = lazy(() => import("./pages/Home/Default"));
const Help = lazy(() => import("./pages/Help/Default"));
const HelpComponents = lazy(() => import("./pages/Help/Components/Default"));
const Creatives = lazy(() => import("./pages/Creatives/Default"));
const Edit = lazy(() => import("./pages/Creatives/Edit"));
const FullLayout = lazy(() => import("./layouts/FullLayout"));
const AssetUpload = lazy(() => import("./pages/Assets/Upload"));
const Community = lazy(() => import("./pages/Community/Index"));
const Templates = lazy(() => import("./pages/Templates/Index"));

function LayoutWrapper() {
  // Render MainLayout with Router's Outlet inside Content area
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <AntApp>
      <AuthProvider>
        <BrowserRouter>
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
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<LayoutWrapper />}>
                  <Route index element={<Home />} />
                  <Route path="creatives/*" element={<Creatives />} />
                  <Route path="community/*" element={<Community />} />
                  <Route path="templates/*" element={<Templates />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/help/components" element={<HelpComponents />} />
                  {/* Creatives list page */}
                  <Route
                    path="creatives/edit"
                    element={<Navigate to="/creatives/edit" replace />}
                  />
                  <Route path="assets/upload" element={<AssetUpload />} />
                </Route>

                {/* Render edit page using a full-bleed layout (no sider) */}
                <Route
                  path="creatives/edit/:creativeId"
                  element={
                    <Suspense fallback={<div />}>
                      <FullLayout>
                        <Edit />
                      </FullLayout>
                    </Suspense>
                  }
                />
              </Routes>
            </ProtectedRoute>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </AntApp>
  );
}

export default App;
