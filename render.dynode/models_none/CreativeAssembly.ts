import mongoose from "mongoose";
import creativeBaseSchema from "./shared/Creative";

const creativeAssemblySchema = new mongoose.Schema(
  {
    ...creativeBaseSchema.obj, // Spread base schema fields
    assemblySpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_assemblies",
  }
);

const CreativeAssembly = mongoose.model(
  "CreativeAssembly",
  creativeAssemblySchema
);

export default CreativeAssembly;
