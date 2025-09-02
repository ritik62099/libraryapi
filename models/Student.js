


// import mongoose from "mongoose";

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   roll: { type: String, required: true, unique: true },
//   mobile: String,
//   address: String,
//   monthlyFee: { type: Number, default: 1000 },
//   feesPaid: { type: Number, default: 0 },
//   lastPaymentDate: { type: Date },
// });

// export default mongoose.model("Student", studentSchema);

// models/Student.js





// import mongoose from "mongoose";

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   roll: { type: String, required: true, unique: true },
//   mobile: String,
//   address: String,
//   monthlyFee: { type: Number, default: 1000 },
//   feesPaid: { type: Number, default: 0 },
//   lastPaymentDate: { type: Date },
//   admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true } // admin linked
// });

// // Optional: Better error messages
// studentSchema.post("save", function(error, doc, next) {
//   if (error.code === 11000 && error.keyPattern.roll) {
//     next(new Error("Roll number must be unique"));
//   } else {
//     next(error);
//   }
// });

// export default mongoose.model("Student", studentSchema);


import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true }, // ✅ ab globally unique nahi hai
  mobile: String,
  address: String,
  monthlyFee: { type: Number, default: 1000 },
  feesPaid: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // ✅ linked with admin
});

// ✅ Compound index: Roll unique per admin only
studentSchema.index({ roll: 1, admin: 1 }, { unique: true });

// ✅ Error handling for duplicate roll numbers
studentSchema.post("save", function (error, doc, next) {
  if (error.code === 11000) {
    next(new Error("This roll number already exists for this admin"));
  } else {
    next(error);
  }
});

export default mongoose.model("Student", studentSchema);
