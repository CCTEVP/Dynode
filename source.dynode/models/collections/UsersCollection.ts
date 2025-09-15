import mongoose from "mongoose";
import changeSchema from "../shared/ChangeSchema";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    // List of domain IDs the user belongs to
    domains: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Domain",
      default: [],
    },
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

const UsersCollection =
  mongoose.models.User || mongoose.model("User", userSchema);
export default UsersCollection;
