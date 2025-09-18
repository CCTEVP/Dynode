import mongoose from "mongoose";
import { elementsCollectionSchema } from "../collections/ElementsCollection";

const elementsBindingViewSchema = new mongoose.Schema(
  {
    ...elementsCollectionSchema.obj,
    contents: { type: String, required: false },
  },
  {
    collection: "elements_binding",
  }
);

const ElementsBindingView = mongoose.model(
  "ElementsBindingView",
  elementsBindingViewSchema,
  "elements_binding"
);

export default ElementsBindingView;
