import mongoose from "mongoose";
import creativeBaseViewSchema from "./CreativeBaseViewSchema";

const creativeDynamicViewSchema = new mongoose.Schema(
  {
    ...creativeBaseViewSchema.obj, // Spread base schema fields
    dynamicSpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_dynamics_elements",
  }
);

const CreativeDynamicView = mongoose.model(
  "CreativeDynamicView",
  creativeDynamicViewSchema
);

export default CreativeDynamicView;
