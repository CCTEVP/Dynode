import mongoose from "mongoose";

const contentsSchema = new mongoose.Schema(
  {
    slideLayout: { type: String, required: false },
    frameLayout: { type: String, required: false },
  },
  { _id: false }
);
export default contentsSchema;
