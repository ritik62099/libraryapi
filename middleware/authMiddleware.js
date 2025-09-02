import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ success: false, message: "Token failed" });
  }
};

export default authMiddleware;



// import jwt from "jsonwebtoken";
// import Admin from "../models/Admin.js";

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const admin = await Admin.findById(decoded.id);
//     if (!admin) return res.status(401).json({ message: "Unauthorized: Admin not found" });

//     req.admin = admin;
//     next();
//   } catch (err) {
//     console.error("JWT verification failed:", err);
//     res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };

// export default authMiddleware;
