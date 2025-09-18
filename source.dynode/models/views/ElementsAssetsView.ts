import mongoose from "mongoose";
import { elementsCollectionSchema } from "../collections/ElementsCollection";

const elementsAssetsViewSchema = new mongoose.Schema(
  {
    ...elementsCollectionSchema.obj, // Spread base schema fields
    source: { type: String, required: false },
  },
  {
    collection: "elements_assets",
  }
);

const ElementsAssetsView = mongoose.model(
  "ElementsAssetsView",
  elementsAssetsViewSchema,
  "elements_assets"
);

export default ElementsAssetsView;
