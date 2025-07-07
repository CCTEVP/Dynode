import mongoose from "mongoose";
import creativeBaseSchema from "../shared/CreativeBaseCollectionSchema";

// Decide on the collection for CreativeDynamic: With elements or without?

const creativeDynamicCollectionSchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    resources: { type: Object, required: false },
    // Add more fields as needed
  },
  {
      collection: "creatives_dynamics",
      timestamps: false,
      versionKey: false,

  }
);

const CreativeDynamicCollection = mongoose.model(
  "CreativeDynamicCollection",
  creativeDynamicCollectionSchema
);

export default CreativeDynamicCollection;
