// import mongoose from "mongoose";

// const adminSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // hashed password
// });

// export default mongoose.model("Admin", adminSchema);



import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  publicUrl: { type: String }, // optional: admin ka personalized link
});

export default mongoose.model("Admin", adminSchema);
