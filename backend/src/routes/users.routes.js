import {Router} from "express";
import { addToHistory, getUserHistory, login, register, getProfile, authenticateToken } from "../controllers/user.controller.js";
import passport from "../config/passport.js";
import { sendResetOtp, verifyResetOtp, resetPassword } from "../controllers/user.controller.js";


const router = Router();

const getDefaultFrontendUrl = () => {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
};

const isAllowedFrontendOrigin = (candidateUrl) => {
  if (!candidateUrl || typeof candidateUrl !== "string") return false;
  try {
    const parsed = new URL(candidateUrl);
    const origin = parsed.origin;
    const allowedOrigins = new Set([
      getDefaultFrontendUrl(),
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://meet-in-virtual.vercel.app"
    ]);
    return allowedOrigins.has(origin);
  } catch {
    return false;
  }
};

const resolveRequestFrontendUrl = (req) => {
  const candidates = [req.query.redirect, req.get("origin"), req.get("referer")];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const origin = new URL(candidate).origin;
      if (isAllowedFrontendOrigin(origin)) {
        return origin;
      }
    } catch {
      // Ignore malformed candidate URLs
    }
  }
  return getDefaultFrontendUrl();
};

const encodeOAuthState = (frontendUrl) => {
  return Buffer.from(JSON.stringify({ redirect: frontendUrl }), "utf8").toString("base64url");
};

const resolveFrontendUrlFromState = (stateParam) => {
  if (stateParam && typeof stateParam === "string") {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"));
      if (isAllowedFrontendOrigin(decoded?.redirect)) {
        return decoded.redirect.replace(/\/+$/, "");
      }
    } catch {
      // Ignore malformed state and fall back to default
    }
  }
  return getDefaultFrontendUrl();
};

router.route("/login").post(login);
router.route("/register").post(register);

// Protected routes - require authentication
router.route("/add_to_activity").post(authenticateToken, addToHistory);
router.route("/get_all_activity").get(authenticateToken, getUserHistory);
router.route("/profile").get(authenticateToken, getProfile);

router.route("/forgot-password/send-otp").post(sendResetOtp);
router.route("/forgot-password/verify-otp").post(verifyResetOtp);
router.route("/forgot-password/reset").post(resetPassword);


// Google OAuth routes
router.get("/auth/google", (req, res, next) => {
  const frontendUrl = resolveRequestFrontendUrl(req);
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/auth?error=google_failed`);
  }

  const state = encodeOAuthState(frontendUrl);
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state
  })(req, res, next);
});

router.get("/auth/google/callback", (req, res, next) => {
  const frontendUrl = resolveFrontendUrlFromState(req.query.state);
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/auth?error=google_failed`);
  }

  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error("Google OAuth callback error:", err || info);
      return res.redirect(`${frontendUrl}/auth?error=google_failed`);
    }
    return res.redirect(`${frontendUrl}/auth/google/success?token=${encodeURIComponent(user.token)}`);
  })(req, res, next);
});

export default router;
