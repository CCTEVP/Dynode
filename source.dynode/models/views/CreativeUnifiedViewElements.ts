import mongoose from "mongoose";
import creativeBaseViewSchema from "../shared/CreativeBaseViewSchema";

const CreativeUnifiedViewElementsSchema = new mongoose.Schema(
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

const CreativeUnifiedViewElements = mongoose.model(
  "CreativeUnifiedViewElements",
  CreativeUnifiedViewElementsSchema
);

export default CreativeUnifiedViewElements;
