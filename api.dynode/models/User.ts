import mongoose from "mongoose";
import changeSchema from "./shared/ChangeSchema";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    created: { type: Date },
    updated: { type: Date },
    changes: { type: [changeSchema], default: [] }, // Use the imported schema here
  },
  {
    collection: "users",
    timestamps: false,
    versionKey: false,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
