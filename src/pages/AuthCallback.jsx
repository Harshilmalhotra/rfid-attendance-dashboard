// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSession = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Error exchanging code for session:", error.message);
        return;
      }
      navigate("/attendance");
    };

    handleSession();
  }, [navigate]);

  return <p>Logging you in...</p>;
};

export default AuthCallback;
