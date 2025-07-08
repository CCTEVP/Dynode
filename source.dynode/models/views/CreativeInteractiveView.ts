import mongoose from "mongoose";
import creativeBaseViewSchema from "../shared/CreativeBaseViewSchema";
const creativeInteractiveViewSchema = new mongoose.Schema(
  {
    ...creativeBaseViewSchema.obj, // Spread base schema fields
    interativeSpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_interactives_elements",
  }
);

const CreativeInteractiveView = mongoose.model(
  "CreativeInteractiveView",
  creativeInteractiveViewSchema
);

export default CreativeInteractiveView;
