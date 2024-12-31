import { Request, Response } from "express";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getsignedUrl = async (req: Request, res: Response) => {
  try {
    const { bucket, key } = req.body;
    const getObjectParams = {
      Bucket: bucket,
      Key: key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    res.status(200).json({
      url: url,
    });
  } catch (error) {
    console.error("Error generating GET signed URL:", error);
    res.status(500).json({
      error: "Failed to generate signed URL",
    });
  }
};

export const putSignedUrl = async (req: Request, res: Response) => {
    try {
        const { bucket, key, contentType } = req.body;
    
        const putObjectParams = {
          Bucket: bucket,
          Key: key,
          ContentType: contentType
        };
    
        const command = new PutObjectCommand(putObjectParams);
        const url = await getSignedUrl(client, command, { expiresIn: 180 });
    
        res.json({
          url: url
        });
      } catch (error) {
        console.error('Error generating PUT signed URL:', error);
        res.status(500).json({
          error: 'Failed to generate signed URL'
        });
      }
};
