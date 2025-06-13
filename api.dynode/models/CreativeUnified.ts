import mongoose from "mongoose";
import creativeBaseSchema from "./shared/Creative";

const creativeUnifiedSchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    unifiedSpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_unified",
  }
);

const CreativeUnified = mongoose.model(
  "CreativeUnified",
  creativeUnifiedSchema
);

export default CreativeUnified;
