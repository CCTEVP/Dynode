import mongoose from "mongoose";
import changeSchema from "./shared/Change";

const creativeSchema = new mongoose.Schema(
  {
    creativeId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String },
    campaignName: { type: String },
    changes: { type: [changeSchema], default: [] }, // Use the imported schema here
  },
  {
    collection: "creatives_unified",
    timestamps: true,
  }
);

const Creative =
  mongoose.models.Creative || mongoose.model("Creative", creativeSchema);
export default Creative;
