import mongoose from "mongoose";
import changeSchema from "./Change";
import cacheSchema from "./Cache";

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

const creativeBaseSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    styles: { type: Map, of: String, default: {} },
    elements: { type: [elementsSchema], default: [] }, // <-- FIXED
    format: { type: [formatSchema], default: [] }, // <-- FIXED
    parent: [{ type: String }],
    changes: { type: [changeSchema], default: [] },
    cache: { type: cacheSchema, default: { duration: "20" } }, // <-- FIXED
  },
  {
    discriminatorKey: "creativeType",
    // _id: false, // REMOVE this line for root documents
  }
);

export default creativeBaseSchema;
