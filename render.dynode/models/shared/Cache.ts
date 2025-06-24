import mongoose from "mongoose";

const cacheSchema = new mongoose.Schema(
  {
    duration: { type: String, required: false }, // Duration for which the cache is valid
  },
  { _id: false } // Prevents Mongoose from creating an _id for each subdocument
);

export default cacheSchema;
