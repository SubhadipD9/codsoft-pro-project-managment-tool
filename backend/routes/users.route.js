import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { z } from "zod";
import UserModel from "../models/users.js";
import cors from "cors";

import bcrypt from "bcrypt";

dotenv.config();

const userRouter = express.Router();

userRouter.use(express.json());
userRouter.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("add a jwt secret key in the .env file");
}

userRouter.post("/signup", async (req, res) => {
  const validFormat = z.object({
    email: z
      .string()
      .min(6, { message: "email is too short" })
      .max(30, { message: "email length is reached" })
      .email(),
    password: z
      .string()
      .min(6, { message: "minimum length is 6" })
      .max(30, { message: "password is more than the limit" })
      .refine((password) => /[A-Z]/.test(password), {
        message: "Please add an uppercase character",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Please add an lowercase character",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Please add an number into it",
      })
      .refine((password) => /[!@#$%^&*]/.test(password), {
        message: "Please add a special character",
      }),
    name: z
      .string()
      .min(3, { message: "Your name is too short" })
      .max(20, { message: "name limit reached" }),
    username: z
      .string()
      .min(4, { message: "Your username is too short" })
      .max(20, { message: "username limit reached" }),
  });

  const requireData = validFormat.safeParse(req.body);

  if (!requireData.success) {
    res.status(403).json({
      message: "Incorrect format or you miss some data",
      error: requireData.error.issues[0].message,
    });
    return;
  }

  const userData = requireData.data;

  try {
    const [existingEmail, existingUsername] = await Promise.all([
      UserModel.findOne({ email: userData.email }),
      UserModel.findOne({ username: userData.username }),
    ]);

    if (existingEmail || existingUsername) {
      res.status(409).json({
        message: existingEmail
          ? "This email already exists"
          : "This username is already taken",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await UserModel.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      username: userData.username,
    });

    res.status(201).json({
      message: "User successfully created",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while registering the user.",
    });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(409).json({
      message: !email ? "Enter the email" : "Enter the password",
    });
    return;
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      res.status(403).json({
        message: "User not found",
      });
      return;
    }

    const checkPasswordIsValid = await bcrypt.compare(password, user.password);

    if (!checkPasswordIsValid) {
      res.status(403).json({
        message: "You enter a wrong password",
      });
      return;
    }

    if (user) {
      const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({
        message: "You are logged in",
        token: token,
        username: user.username,
      });
    } else {
      res.status(403).json({
        message:
          "Email or password is incorrect. Please check your credentials.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An error occurred during login.",
    });
  }
});

export default userRouter;
