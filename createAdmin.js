// // createAdmin.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import Admin from "./models/Admin.js";
// import connectDB from "./config/db.js";

// dotenv.config();
// await connectDB();

// const createAdmin = async () => {
//   try {
//     const username = "anjali";         // 👈 yahan naya username
//     const plainPassword = "123456"; // 👈 yahan naya password

//     const existingAdmin = await Admin.findOne({ username });

//     if (existingAdmin) {
//       console.log(`⚠️ Admin already exists: ${username}`);
//     } else {
//       const hashed = await bcrypt.hash(plainPassword, 10);
//       await Admin.create({ username, password: hashed });
//       console.log(`✅ Admin created: username=${username}, password=${plainPassword}`);
//     }
//   } catch (error) {
//     console.error("❌ Error creating admin:", error.message);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// createAdmin();


// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Student from "./models/Student.js"; // path check karo

// dotenv.config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ MongoDB connected");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err);
//     process.exit(1);
//   }
// };

// const cleanStudents = async () => {
//   try {
//     // 1️⃣ Delete students with blank roll
//     const blankResult = await Student.deleteMany({ roll: "" });
//     console.log(`Deleted ${blankResult.deletedCount} students with blank roll.`);

//     // 2️⃣ Remove duplicate roll numbers for same admin, keep first
//     const duplicates = await Student.aggregate([
//       {
//         $group: {
//           _id: { admin: "$admin", roll: "$roll" },
//           ids: { $push: "$_id" },
//           count: { $sum: 1 },
//         },
//       },
//       { $match: { count: { $gt: 1 } } },
//     ]);

//     let totalDeleted = 0;
//     for (const doc of duplicates) {
//       const [keep, ...remove] = doc.ids;
//       const delRes = await Student.deleteMany({ _id: { $in: remove } });
//       totalDeleted += delRes.deletedCount;
//       console.log(`Deleted ${delRes.deletedCount} duplicate(s) for roll ${doc._id.roll}`);
//     }

//     console.log(`✅ Total duplicate students deleted: ${totalDeleted}`);

//     // 3️⃣ Ensure compound index for future
//     await Student.collection.dropIndex("admin_1_roll_1").catch(() => {}); // ignore if not exists
//     await Student.collection.createIndex({ admin: 1, roll: 1 }, { unique: true });
//     console.log("✅ Compound index (admin + roll) ensured");

//     console.log("✅ Database cleanup completed successfully");
//   } catch (err) {
//     console.error("❌ Error cleaning database:", err);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// const run = async () => {
//   await connectDB();
//   await cleanStudents();
// };

// run();
