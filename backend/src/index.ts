import express from "express";
import authRoutes from "./routes/authRoutes";
import courses from "./routes/courses";
import verifyJWT from "./routes/jwtVerificationRoute";
import signedUrl  from "./routes/signedUrl";
import payment from "./routes/payment"
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send(`server is healthy`);
});

//signin/signup
app.use("/api/v1", authRoutes);

//course related route
app.use("/api/v1", courses);

//jwt verification route
app.use("/api/v1", verifyJWT);

//to get s3 Signed url
app.use("/api/v1", signedUrl);

//payment routes
app.use("/api/v1", payment);

app.listen(3000, () => {
  console.log(`listening to port 3000`);
});
