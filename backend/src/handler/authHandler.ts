import prisma from "../../lib/prisma";

import { Request, Response } from "express";
import { z } from "zod";
import { userSchema } from "../utils/validation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username || !role) {
      res.status(400).send(`Credentials required`);
      return;
    }

    userSchema.parse({
      username,
      email,
      password,
    });

    // email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }
      if (existingUser.username === username) {
        res.status(409).json({ error: "Username already taken" });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      userId: createUser?.id,
      email: email,
    });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send(`Missing Fields`);
      return;
    }

    const userDetails = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (
      !userDetails ||
      !(await bcrypt.compare(password, userDetails.password))
    ) {
      res.status(400).json({
        message: `Invalid credentials`,
      });
      return;
    }

    if (!JWT_SECRET) {
      throw new Error(`JWT_SECRET missing`);
    }

    const token = jwt.sign(
      {
        userId: userDetails.id,
        userEmail: userDetails.email,
        username: userDetails.username,
        role: userDetails.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token: token,
      userId: userDetails.id,
    });
  } catch (error) {
    console.error(error);
  }
};
