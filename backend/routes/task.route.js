import express from "express";
import ProjectModel from "../models/projects.js";
import UserModel from "../models/users.js";
import auth from "../middleware/auth.js";
import { mongoose } from "mongoose";
import slugify from "../utils/slugify.js";
import ownerChecking from "../middleware/ownerChecking.js";
import TaskModel from "../models/tasks.js";

const taskRouter = express.Router();

taskRouter.use(express.json());
taskRouter.use(auth);

taskRouter.get("/:projectId", async (req, res) => {
  const tasks = await TaskModel.find({ project: req.params.projectId });

  if (!tasks || tasks.length === 0) {
    return res.status(404).json({
      message: "No tasks are assigned to this project",
    });
  }

  res.status(200).json({
    message: "Tasks fetch successfully",
    tasks,
  });
});

taskRouter.post("/create-task/:projectId", ownerChecking, async (req, res) => {
  const { projectId } = req.params;
  const { title, status, assignedTo, time } = req.body;

  if (!title || !status || !assignedTo || !time) {
    return res.status(409).json({
      message: "required fields are empty",
    });
  }

  try {
    const slug = slugify(title);

    const existingTask = await TaskModel.findOne({
      slug: slug,
      project: projectId,
    });

    if (existingTask) {
      return res.status(409).json({
        message: "this task is already exist",
      });
    }

    const createTask = await TaskModel.create({
      title: title,
      slug: slug,
      project: projectId,
      assignedTo: assignedTo,
      status: status,
      dueDate: time,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task: createTask,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong while creating the task",
    });
  }
});

taskRouter.patch("/update-task/:taskId", async (req, res) => {
  const { status } = req.body;
  const { taskId } = req.params;

  try {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { status: status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

taskRouter.delete("/delete-task/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    const data = TaskModel.findByIdAndDelete(taskId);

    if (!data) {
      return res.status(404).json({ message: "task not found" });
    }

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default taskRouter;
