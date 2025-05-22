import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  owner: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: { type: Date, default: Date.now },
  slug: { type: String, required: true },
});

ProjectSchema.index({ ownerId: 1, slug: 1 }, { unique: true });

const ProjectModel = mongoose.model("project", ProjectSchema);

export default ProjectModel;
