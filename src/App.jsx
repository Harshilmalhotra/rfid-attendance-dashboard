import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AttendanceLog from "./pages/AttendanceLog";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Components
import Sidebar from "./components/Sidebar";
import PageWrapper from "./components/PageWrapper";
import Footer from "./components/Footer";
import MigrationNotice from "./components/MigrationNotice";

// Helper for timestamped logs
const logEvent = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) console.log(data);
};

// Layout for protected pages
const ProtectedLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <div className="flex-grow flex">
      <Sidebar />
      <PageWrapper>{children}</PageWrapper>
    </div>
    <Footer />
  </div>
);

// Layout for public pages
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <div className="flex-grow">{children}</div>
    <Footer />
  </div>
);

// Route protection
const PrivateRoute = ({ session, children }) => {
  return session ? children : <Navigate to="/auth" replace />;
};

// Animated route transitions
const AnimatedRoutes = ({ session }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<Navigate to={session ? "/dashboard" : "/auth"} replace />}
        />
        <Route
          path="/auth"
          element={
            session ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PublicLayout>
                <Auth />
              </PublicLayout>
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute session={session}>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute session={session}>
              <ProtectedLayout>
                <AttendanceLog />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute session={session}>
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute session={session}>
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            <PublicLayout>
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            </PublicLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        logEvent("❌ Error fetching session", error);
      } else {
        setSession(session);
        if (session?.user?.email) {
          logEvent("✅ Initial session loaded. Logged in as", { email: session.user.email });
        } else {
          logEvent("📭 No active session found");
        }
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      logEvent(`🔄 Auth state changed: ${event}`);
      if (session?.user?.email) {
        logEvent("👤 User email:", { email: session.user.email });
      }
      setSession(session);

      if (event === "SIGNED_IN") {
        logEvent("✅ User signed in");
      } else if (event === "SIGNED_OUT") {
        logEvent("🚪 User signed out");
      } else if (event === "USER_UPDATED") {
        logEvent("🛠️ User profile updated");
      } else if (event === "TOKEN_REFRESHED") {
        logEvent("♻️ Token refreshed");
      } else if (event === "PASSWORD_RECOVERY") {
        logEvent("🔐 Password recovery in process");
      }
    });

    return () => {
      logEvent("🔚 Cleaning up auth listener");
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <Router>
      <MigrationNotice />
      <AnimatedRoutes session={session} />
    </Router>
  );
}

export default App;
