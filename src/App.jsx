import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Pages
import Auth from "./pages/Auth";
import AttendanceLog from "./pages/AttendanceLog";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Auth-protected route component
function PrivateRoute({ session, children }) {
  return session ? children : <Navigate to="/auth" replace />;
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
      <Routes>
        {/* Redirect root to dashboard if logged in, otherwise to auth */}
        <Route
          path="/"
          element={<Navigate to={session ? "/dashboard" : "/auth"} replace />}
        />

        {/* Public Auth route */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute session={session}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute session={session}>
              <AttendanceLog />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute session={session}>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute session={session}>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
