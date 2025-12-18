import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private cloudfrontDomain: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials:
        process.env.AWS_S3_CREDENTIALS_REQUIRED === 'true'
          ? {
              accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
            }
          : undefined,
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
    this.cloudfrontDomain = process.env.CLOUDFRONT_URL!;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const key = `${folder}${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `${this.cloudfrontDomain}/${key}`;
  }
}
