import mongoose from "mongoose";
import creativeBaseSchema from "../shared/CreativeBaseCollectionSchema";

const creativeInteractiveCollectionSchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    resources: { type: Object, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_interactives",
  }
);

const CreativeInteractiveCollection = mongoose.model(
  "CreativeInteractiveCollection",
  creativeInteractiveCollectionSchema
);

export default CreativeInteractiveCollection;
