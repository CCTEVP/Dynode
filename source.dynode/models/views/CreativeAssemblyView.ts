import mongoose from "mongoose";
import creativeBaseViewSchema from "../shared/CreativeBaseViewSchema";

const creativeAssemblyViewSchema = new mongoose.Schema(
  {
    ...creativeBaseViewSchema.obj, // Spread base schema fields
    assemblySpecificField: { type: String, required: false },
    // Add more fields as needed
  },
  {
    collection: "creatives_assemblies_elements",
  }
);

const CreativeAssemblyView = mongoose.model(
  "CreativeAssemblyView",
  creativeAssemblyViewSchema
);

export default CreativeAssemblyView;
