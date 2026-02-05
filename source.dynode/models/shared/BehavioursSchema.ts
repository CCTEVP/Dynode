import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema(
  {
    comparison_type: { type: String, required: true },
    value_type: { type: String, required: true },
    values: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const ruleSchema = new mongoose.Schema(
  {
    comparisons: {
      type: [comparisonSchema],
      default: undefined,
    },
    comparison_type: { type: String, required: false },
    value_type: { type: String, required: false },
    values: {
      type: [mongoose.Schema.Types.Mixed],
      default: undefined,
    },
  },
  { _id: false }
);

const behaviourDefinitionSchema = new mongoose.Schema(
  {
    rules: {
      type: [ruleSchema],
      default: [],
    },
  },
  { _id: false }
);

const behaviourSchema = new mongoose.Schema(
  {},
  {
    _id: false,
    strict: false,
  }
);

behaviourSchema.add({
  visibility: {
    type: behaviourDefinitionSchema,
    required: false,
  },
});

export default behaviourSchema;
