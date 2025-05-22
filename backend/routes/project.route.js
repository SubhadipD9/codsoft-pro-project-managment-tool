import express from "express";
import ProjectModel from "../models/projects.js";
import UserModel from "../models/users.js";
import auth from "../middleware/auth.js";
import { mongoose } from "mongoose";
import slugify from "../utils/slugify.js";
import ownerChecking from "../middleware/ownerChecking.js";

const projectRouter = express.Router();

projectRouter.use(express.json());
projectRouter.use(auth);

projectRouter.get("/projects", async (req, res) => {
  //   const userId = new mongoose.Types.ObjectId(req.userId);
  try {
    const projects = await ProjectModel.find({ ownerId: req.userId });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "No project found",
      });
    }

    res.status(200).json({
      message: "project fetch successfully",
      projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while fetching blogs",
    });
  }
});

projectRouter.get("/only-view/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const response = await ProjectModel.findById(projectId);

    if (!response || response.length === 0) {
      return res.status(404).json({
        message: "No project found",
      });
    }

    res.status(200).json({
      message: "project fetch successfully",
      response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while fetching blogs",
    });
  }
});

projectRouter.post("/create-project", async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  if (!userId) {
    return res.status(403).json({
      message: "You are not authorize",
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const slug = slugify(title);

    const duplicatePost = await ProjectModel.findOne({
      ownerId: userId,
      slug: slug,
    });

    if (duplicatePost) {
      return res.status(409).json({
        message: "this project is already exist",
      });
    }

    const newProject = await ProjectModel.create({
      title,
      description,
      owner: user.username,
      ownerId: userId,
      slug,
    });

    res.status(201).json({
      message: "Post successfully created",
      post: newProject,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating the post" });
  }
});

projectRouter.put(
  "/edit-project/:projectId",
  ownerChecking,
  async (req, res) => {
    const { projectId } = req.params;
    const { title, description } = req.body;
    const userId = req.userId;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newSlug = slugify(title);

      const updatedProject = await ProjectModel.findByIdAndUpdate(
        projectId,
        {
          title,
          description,
          slug: newSlug,
          owner: user.username,
          ownerId: user._id,
        },
        { new: true }
      );

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.status(200).json({
        message: "Project updated successfully",
        project: updatedProject,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating the project" });
    }
  }
);

projectRouter.delete(
  "/delete-project/:projectId",
  ownerChecking,
  async (req, res) => {
    const { projectId } = req.params;

    try {
      const deleteProject = await ProjectModel.findByIdAndDelete(projectId);

      if (!deleteProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      res.status(200).json({
        message: "Project successfully deleted",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Error deleting the post",
      });
    }
  }
);

projectRouter.get("/view-for-edit/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const post = await ProjectModel.findOne({ slug });

    if (!post) return res.status(404).json({ message: "Project not found" });

    if (!post) {
      if (!req.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (req.userId !== post.ownerId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.status(200).json({ post });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default projectRouter;
