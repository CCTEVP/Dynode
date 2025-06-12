import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // <-- changed
    newValue: { type: mongoose.Schema.Types.Mixed, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed, required: false },
  },
  { _id: false } // Prevents Mongoose from creating an _id for each subdocument
);

export default changeSchema;
