import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ||
          "super_secure_vasudha_foundation_jwt_secret_key_2026",
      );

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ message: "User not found or token expired" });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ message: "Account is deactivated. Contact Super Admin." });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
