import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

async function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(403).json({
      message: "No token provide or unauthorize",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = data.id;
    next();
  });
}

export default auth;
