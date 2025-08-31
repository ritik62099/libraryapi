import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Absent"], default: "Present" },
});

export default mongoose.model("Attendance", attendanceSchema);


// import mongoose from "mongoose";

// const attendanceSchema = new mongoose.Schema({
//   student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
//   date: { type: Date, default: Date.now },
//   status: { type: String, enum: ["Present", "Absent"], default: "Present" },
// });

// export default mongoose.model("Attendance", attendanceSchema);