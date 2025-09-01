// import express from "express";
// import Attendance from "../models/Attendance.js";
// import Student from "../models/Student.js";

// const router = express.Router();



// router.post("/", async (req, res) => {
//   try {
//     const { studentId } = req.body;
//     if (!studentId) return res.status(400).json({ message: "studentId is required" });

//     const student = await Student.findById(studentId);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     const now = new Date();
//     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

//     const existing = await Attendance.findOne({
//       student: studentId,
//       date: { $gte: startOfDay, $lt: endOfDay },
//     });

//     if (existing) return res.json({ message: "Already marked today" });

//     const attendance = new Attendance({ student: studentId });
//     await attendance.save();

//     res.json({ message: "Attendance marked successfully", attendance });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// });


// // Get daily attendance



// // Get daily attendance
// router.get("/daily/:date", async (req, res) => {
//   const { date } = req.params;
//   const start = new Date(date);
//   const end = new Date(start);
//   end.setDate(end.getDate() + 1);

//   const students = await Student.find();
//   const attendanceRecords = await Attendance.find({
//     date: { $gte: start, $lt: end }
//   });

//   // Map studentId => status
//   const statusMap = {};
//   attendanceRecords.forEach(a => {
//     statusMap[a.student.toString()] = a.status || "Present";
//   });

//   // Prepare final daily report
//   const dailyReport = students.map(student => ({
//     student,
//     status: statusMap[student._id.toString()] || "Absent",
//   }));

//   res.json(dailyReport);
// });

// // Get monthly attendance
// // Get monthly attendance for a specific student
// router.get("/monthly/:month", async (req, res) => {
//   const { month } = req.params; // format: YYYY-MM
//   const start = new Date(`${month}-01`);
//   const end = new Date(start);
//   end.setMonth(end.getMonth() + 1);

//   const students = await Student.find();
//   const attendanceRecords = await Attendance.find({
//     date: { $gte: start, $lt: end }
//   });

//   // Group attendance by date + student
//   const attendanceMap = {};
//   attendanceRecords.forEach(a => {
//     const key = `${a.date.toISOString().split("T")[0]}_${a.student.toString()}`;
//     attendanceMap[key] = a.status || "Present";
//   });

//   // Generate monthly report
//   const monthlyReport = [];

//   const currentDate = new Date(start);
//   while (currentDate < end) {
//     const dateStr = currentDate.toISOString().split("T")[0];

//     students.forEach(student => {
//       const key = `${dateStr}_${student._id.toString()}`;
//       monthlyReport.push({
//         date: new Date(dateStr),
//         student,
//         status: attendanceMap[key] || "Absent",
//       });
//     });

//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   res.json(monthlyReport);
// });


// export default router;




import express from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Mark attendance (login required)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findOne({ _id: studentId, admin: req.admin._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const existing = await Attendance.findOne({
      admin: req.admin._id,
      student: studentId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) return res.json({ message: "Already marked today" });

    const attendance = new Attendance({ student: studentId, admin: req.admin._id });
    await attendance.save();

    res.json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUBLIC attendance route – roll + name (no login)
 */
router.post("/public", async (req, res) => {
  try {
    const { roll, name } = req.body;
    const student = await Student.findOne({ roll, name });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const existing = await Attendance.findOne({
      student: student._id,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) return res.json({ message: "Already marked today" });

    const attendance = new Attendance({ student: student._id, admin: student.admin });
    await attendance.save();

    res.json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get daily attendance
// Get daily attendance
router.get("/daily/:date", authMiddleware, async (req, res) => {
  const { date } = req.params;
  const start = new Date(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  // Only students of this admin
  const students = await Student.find({ admin: req.admin._id });
  
  const attendanceRecords = await Attendance.find({
    admin: req.admin._id, // filter by current admin
    date: { $gte: start, $lt: end },
  });

  const statusMap = {};
  attendanceRecords.forEach(a => {
    statusMap[a.student.toString()] = a.status || "Present";
  });

  const dailyReport = students.map(student => ({
    student,
    status: statusMap[student._id.toString()] || "Absent",
  }));

  res.json(dailyReport);
});

// Get monthly attendance for a specific student
router.get("/monthly/:month", authMiddleware, async (req, res) => {
  const { month } = req.params; // YYYY-MM
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const students = await Student.find({ admin: req.admin._id });

  const attendanceRecords = await Attendance.find({
    admin: req.admin._id, // only current admin
    date: { $gte: start, $lt: end },
  });

  const attendanceMap = {};
  attendanceRecords.forEach(a => {
    const key = `${a.date.toISOString().split("T")[0]}_${a.student.toString()}`;
    attendanceMap[key] = a.status || "Present";
  });

  const monthlyReport = [];
  const currentDate = new Date(start);

  while (currentDate < end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    students.forEach(student => {
      const key = `${dateStr}_${student._id.toString()}`;
      monthlyReport.push({
        date: new Date(dateStr),
        student,
        status: attendanceMap[key] || "Absent",
      });
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.json(monthlyReport);
});

export default router;
