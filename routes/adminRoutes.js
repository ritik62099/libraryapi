// import express from "express";
// import Admin from "../models/Admin.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// const router = express.Router();

// // Admin Login
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const admin = await Admin.findOne({ username });
//     if (!admin) return res.json({ success: false, message: "User not found" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.json({ success: false, message: "Invalid password" });

//     const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.json({ success: true, token });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;


import express from "express";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * Admin Login
 * Returns token + adminId + username
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // ✅ Token banate waqt adminId bhi embed karte hain
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      adminId: admin._id,   // ✅ frontend me QR banane ke kaam aayega
      username: admin.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
