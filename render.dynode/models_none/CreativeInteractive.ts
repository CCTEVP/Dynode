import mongoose from "mongoose";
import creativeBaseSchema from "./shared/Creative";

const creativeInteractiveSchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    interativeSpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_interactives_elements",
  }
);

const CreativeInteractive = mongoose.model(
  "CreativeInteractive",
  creativeInteractiveSchema
);

export default CreativeInteractive;
