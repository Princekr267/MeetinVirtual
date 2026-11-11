import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/home", { replace: true });
    } else {
      navigate("/auth?error=google_failed", { replace: true });
    }
  }, [params, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0f1e",
      color: "white",
      fontSize: "1.1rem"
    }}>
      Signing you in...
    </div>
  );
}
