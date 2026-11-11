import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { generateAccessToken } from "../utils/auth.middleware.js";
import crypto from "crypto";

// Build callback URL - normalize BACKEND_URL if set, otherwise use relative path (resolved via proxy: true)
const backendUrl = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
const callbackURL = backendUrl
    ? `${backendUrl}/api/v1/users/auth/google/callback`
    : "/api/v1/users/auth/google/callback";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      proxy: true // Essential behind Render/Railway/Vercel proxies so callbackURL uses HTTPS
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName || (email ? email.split("@")[0] : "Google User");

        if (!email) {
          return done(new Error("Google account did not return an email address."), null);
        }

        let user = await User.findOne({ googleId });

        if (!user) {
          // Check if email already registered normally
          user = await User.findOne({ username: email });
          if (user) {
            // Link Google to existing account
            user.googleId = googleId;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: displayName,
              username: email,
              password: crypto.randomBytes(32).toString("hex"), // dummy password
              googleId
            });
          }
        }

        // Generate JWT token
        const token = generateAccessToken(user._id.toString(), user.username);

        return done(null, { token, userId: user._id, username: user.username });
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.warn("⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured. Google OAuth is disabled.");
}

export default passport;
