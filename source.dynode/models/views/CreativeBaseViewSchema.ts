import mongoose from "mongoose";
import creativeBaseCollectionSchema from "../shared/CreativeBaseCollectionSchema";

const formatSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    aspectRatio: { type: String, required: true },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
  },
  { timestamps: false, _id: false }
);

const elementsSchema = new mongoose.Schema(
  {
    slideLayout: { type: String, required: false },
    frameLayout: { type: String, required: false },
  },
  { _id: false }
);

const creativeBaseViewSchema = new mongoose.Schema(
  {
    ...creativeBaseCollectionSchema.obj, // Spread base schema fields
    elements: { type: [elementsSchema], default: [] }, // <-- FIXED
    format: { type: [formatSchema], default: [] }, // <-- FIXED
  },
  {
    discriminatorKey: "creativeType",
    // _id: false, // REMOVE this line for root documents
  }
);

export default creativeBaseViewSchema;
