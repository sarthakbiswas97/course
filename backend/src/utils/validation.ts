import {z} from "zod"

export const userSchema =  z.object({
    username: z.string().min(3,"username should be minimum of length 3"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6,"Password must be of minimum 6 length")
})