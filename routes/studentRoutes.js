



// import express from "express";
// import Student from "../models/Student.js";
// import Attendance from "../models/Attendance.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// /**
//  * CREATE Student (Admin Only)
//  */

// router.get("/public", async (req, res) => {
//   try {
//     const students = await Student.find();
//     res.json(students);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const student = new Student(req.body);
//     await student.save();
//     res.status(201).json(student);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * READ all students
//  */
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const students = await Student.find();

//     const today = new Date();
//     const month = today.getMonth();
//     const year = today.getFullYear();

//     // Check for current month payment
//     const studentsWithPayment = students.map((s) => {
//       const lastMonth = s.lastPaymentDate ? new Date(s.lastPaymentDate) : null;
//       const paidThisMonth =
//         lastMonth &&
//         lastMonth.getMonth() === month &&
//         lastMonth.getFullYear() === year;

//       return { ...s._doc, paidThisMonth };
//     });

//     res.json(studentsWithPayment);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * DELETE student + attendance
//  */
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const student = await Student.findByIdAndDelete(req.params.id);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     // Delete attendance
//     await Attendance.deleteMany({ student: req.params.id });

//     res.json({ message: "Student and attendance deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * PAY student fee
//  */
// // ====== PAY STUDENT FEE ======
// router.put("/pay/:id", authMiddleware, async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     const today = new Date();
//     const currentMonth = today.getMonth();
//     const lastPaymentMonth = student.lastPaymentDate ? student.lastPaymentDate.getMonth() : -1;

//     // ✅ Agar abhi is month me pay nahi kiya, mark as paid
//     if (lastPaymentMonth !== currentMonth) {
//       student.feesPaid += student.monthlyFee;
//       student.lastPaymentDate = today;
//       await student.save();
//       return res.json({ message: "Payment marked for this month", student });
//     } else {
//       return res.json({ message: "Payment already marked for this month", student });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


// export default router;


import express from "express";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * CREATE Student (Admin Only)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { roll } = req.body;

    // Check if roll already exists for this admin
    const existing = await Student.findOne({ roll, admin: req.admin._id });
    if (existing) {
      return res.status(400).json({ message: "Roll number already exists for this admin" });
    }

    const student = new Student({ ...req.body, admin: req.admin._id });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * READ all students (current admin only)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({ admin: req.admin._id });

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    const studentsWithPayment = students.map((s) => {
      const lastMonth = s.lastPaymentDate ? new Date(s.lastPaymentDate) : null;
      const paidThisMonth =
        lastMonth &&
        lastMonth.getMonth() === month &&
        lastMonth.getFullYear() === year;

      return { ...s._doc, paidThisMonth };
    });

    res.json(studentsWithPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE student + their attendance (current admin only)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, admin: req.admin._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Attendance.deleteMany({ student: req.params.id, admin: req.admin._id });

    res.json({ message: "Student and attendance deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PAY student fee (current admin only)
 */
router.put("/pay/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, admin: req.admin._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const today = new Date();
    const currentMonth = today.getMonth();
    const lastPaymentMonth = student.lastPaymentDate ? student.lastPaymentDate.getMonth() : -1;

    if (lastPaymentMonth !== currentMonth) {
      student.feesPaid += student.monthlyFee;
      student.lastPaymentDate = today;
      await student.save();
      return res.json({ message: "Payment marked for this month", student });
    } else {
      return res.json({ message: "Payment already marked for this month", student });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUBLIC route – all students (no login required)
 */
router.get("/public", async (req, res) => {
  try {
    const { admin } = req.query;

    if (!admin) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // Find students only for this admin
    const students = await Student.find({ admin });
    res.json(students);
  } catch (error) {
    console.error("Public students error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
