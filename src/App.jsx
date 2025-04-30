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

// Pages and components
import Auth from "./pages/Auth";
import AttendanceLog from "./pages/AttendanceLog";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import PageWrapper from "./components/PageWrapper";

// Auth route wrapper
function PrivateRoute({ session, children }) {
  return session ? children : <Navigate to="/auth" replace />;
}

// Separate Routes component to allow animation
function AnimatedRoutes({ session }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<Navigate to={session ? "/dashboard" : "/auth"} replace />}
        />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute session={session}>
              <div className="flex">
                <Sidebar />
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute session={session}>
              <div className="flex">
                <Sidebar />
                <PageWrapper>
                  <AttendanceLog />
                </PageWrapper>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute session={session}>
              <div className="flex">
                <Sidebar />
                <PageWrapper>
                  <Users />
                </PageWrapper>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute session={session}>
              <div className="flex">
                <Sidebar />
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFound />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return (
    <Router>
      <AnimatedRoutes session={session} />
    </Router>
  );
}

export default App;
