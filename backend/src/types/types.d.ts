
import { Request } from "express";

declare global {
    namespace Express{
        interface Request{
            userId: string,
            username: string,
            role: string
        }
    }
}