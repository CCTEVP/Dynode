import mongoose from "mongoose";
import creativeBaseSchema from "../shared/CreativeBaseCollectionSchema";

const creativeAssemblyCollectionSchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    // Add more fields as needed
  },
  {
    collection: "creatives_assemblies",
    timestamps: false,
    versionKey: false,
  }
);

const CreativeAssemblyCollection = mongoose.model(
  "CreativeAssemblyCollection",
  creativeAssemblyCollectionSchema
);

export default CreativeAssemblyCollection;
