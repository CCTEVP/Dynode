import mongoose from "mongoose";
import creativeBaseViewSchema from "../shared/CreativeBaseViewSchema";

const creativeUnifiedViewSchema = new mongoose.Schema(
  {
    ...creativeBaseViewSchema.obj, // Spread base schema fields
    origin: { type: String, required: false },
    resources: { type: Object, required: false },

    // Add more fields as needed
  },
  {
    collection: "creatives_unified_elements",
  }
);

const CreativeUnifiedView = mongoose.model(
  "CreativeUnifiedView",
  creativeUnifiedViewSchema
);

export default CreativeUnifiedView;
