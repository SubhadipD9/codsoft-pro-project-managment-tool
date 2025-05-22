import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  assignedTo: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "done"],
    default: "pending",
  },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
});

const TaskModel = mongoose.model("tasks", TaskSchema);

export default TaskModel;
