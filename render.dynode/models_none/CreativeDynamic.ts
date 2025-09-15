import mongoose from "mongoose";
import creativeBaseSchema from "./shared/Creative";

// Decide on the collection for CreativeDynamic: With elements or without?

const creativeDynamicSchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    dynamicSpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_dynamics_elements",
  }
);

const CreativeDynamic = mongoose.model(
  "CreativeDynamic",
  creativeDynamicSchema
);

export default CreativeDynamic;
