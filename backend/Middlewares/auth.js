import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  if (!token) {
    console.warn("⚠️ [protect] No token provided");
    return res.status(401).json({ error: "No token" });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("email role");
    
    if (!user) {
      console.warn(`⚠️ [protect] Invalid user for token with ID: ${payload.id}`);
      return res.status(401).json({ error: "Invalid user" });
    }
    
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    console.error("❌ [protect] Invalid token:", err.message);
    
    // Provide more specific error messages based on the type of error
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(401).json({ error: "Authentication failed" });
    }
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    console.warn("⚠️ [authorize] No user in request");
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (!roles.includes(req.user.role)) {
    console.warn(`⚠️ [authorize] Forbidden: user role '${req.user.role}' not in [${roles.join(", ")}]`);
    return res.status(403).json({ 
      error: `Access denied. Required roles: ${roles.join(", ")}` 
    });
  }
  
  next();
};