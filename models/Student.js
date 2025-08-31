


import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true },
  mobile: String,
  address: String,
  monthlyFee: { type: Number, default: 1000 },
  feesPaid: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
});

export default mongoose.model("Student", studentSchema);



// import mongoose from "mongoose";

// const studentSchema = new mongoose.Schema({
//   admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
//   name: { type: String, required: true },
//   roll: { type: String, required: true },
//   mobile: String,
//   address: String,
//   monthlyFee: { type: Number, default: 1000 },
//   feesPaid: { type: Number, default: 0 },
//   lastPaymentDate: { type: Date },
// });

// // ✅ Compound index for admin + roll uniqueness
// studentSchema.index({ admin: 1, roll: 1 }, { unique: true });

// export default mongoose.model("Student", studentSchema);
