import ProjectModel from "../models/projects.js";

async function ownerChecking(req, res, next) {
  const { projectId } = req.params;
  const ownerId = req.userId.toString();

  try {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "project not found",
      });
    }

    if (project.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        message: "You are not authorized to modify or anything with is project",
      });
    }
    next();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while checking ownership" });
  }
}

export default ownerChecking;
