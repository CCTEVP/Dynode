import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Spin, App as AntApp, ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/controls/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import { getAntdTheme } from "./theme";

// Lazy load your pages
const Home = lazy(() => import("./pages/Home/Default"));
const Help = lazy(() => import("./pages/Help/Default"));
const HelpComponents = lazy(() => import("./pages/Help/Components/Default"));
const HelpCodebase = lazy(() => import("./pages/Help/Codebase/Default"));
const HelpDesign = lazy(() => import("./pages/Help/Design/Default"));
const Creatives = lazy(() => import("./pages/Creatives/Default"));
const Edit = lazy(() => import("./pages/Creatives/Edit"));
const Sources = lazy(() => import("./pages/Sources/Default"));
const SourceEdit = lazy(() => import("./pages/Sources/Edit"));
const Assets = lazy(() => import("./pages/Assets/Default"));
const AssetEdit = lazy(() => import("./pages/Assets/Edit"));
const FullLayout = lazy(() => import("./layouts/FullLayout"));
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

function AppContent() {
  const { themeMode } = useTheme();

  return (
    <ConfigProvider theme={getAntdTheme(themeMode)}>
      <AntApp message={{ maxCount: 3 }}>
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
                    <Route path="sources" element={<Sources />} />
                    <Route path="assets" element={<Assets />} />
                    <Route path="community/*" element={<Community />} />
                    <Route path="templates/*" element={<Templates />} />
                    <Route path="/help" element={<Help />} />
                    <Route
                      path="/help/components"
                      element={<HelpComponents />}
                    />
                    <Route path="/help/design" element={<HelpDesign />} />
                    <Route path="/help/codebase" element={<HelpCodebase />} />
                    {/* Creatives list page */}
                    <Route
                      path="creatives/edit"
                      element={<Navigate to="/creatives/edit" replace />}
                    />
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

                  {/* Sources edit page using full-bleed layout */}
                  <Route
                    path="sources/:id"
                    element={
                      <Suspense fallback={<div />}>
                        <FullLayout>
                          <SourceEdit />
                        </FullLayout>
                      </Suspense>
                    }
                  />

                  {/* Assets edit page using full-bleed layout */}
                  <Route
                    path="assets/:id"
                    element={
                      <Suspense fallback={<div />}>
                        <FullLayout>
                          <AssetEdit />
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
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
