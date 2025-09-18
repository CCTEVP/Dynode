import mongoose from "mongoose";
import changeSchema from "../shared/ChangeSchema";
import contentsSchema from "../shared/ContentsSchema";

const elementsCollectionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    styles: { type: Map, of: String, default: {} },
    classes: [{ type: String }],
    identifier: [{ type: String }],
    attributes: [{ type: [String] }],
    status: [{ type: String }],
    contents: { type: [contentsSchema], default: [] },
    type: [{ type: String }],
    order: [{ type: Number }],
    parent: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
      },
    ],
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    changes: { type: [changeSchema], default: [] },
  },
  {
    collection: "elements",
    timestamps: false,
    versionKey: false,
  }
);

const ElementsCollection = mongoose.model(
  "ElementsCollection",
  elementsCollectionSchema,
  "elements"
);

// Export both the model (default) and the schema for reuse by view schemas
export { elementsCollectionSchema };
export default ElementsCollection;
