import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../lib/prisma";

dotenv.config()
const JWT_SECRET:string = process.env.JWT_SECRET ?? ""

export const authenticateToken = async (req: Request, res: Response) => {
    
    try {
        
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            res.status(403).json({ error: "No authorization header" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(403).json({ error: "No token provided" });
            return;
        }
        
        try {
            const userInfo = jwt.verify(token, JWT_SECRET) as { userId: string, userEmail: string, username: string };

            const userdetails = await prisma.user.findUnique({
                where:{
                    email: userInfo.userEmail
                }
            })

            if(!userdetails){
                res.status(403).json({ error: "User not found" });
                return;
            }
            

            res.status(200).json({
                userId: userdetails.id,
                username: userdetails.username,
                userRole: userdetails.role
            })

        } catch (error) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};