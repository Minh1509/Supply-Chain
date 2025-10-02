import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { lookup as mimeLookup } from 'mime-types';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import slugify from 'slugify';
import { s3Configuration } from 'src/config';
import { getPresignedDownloadUrlResponseDto } from 'src/modules/shared/aws-s3/dto/get-presign-download-url-response.dto';
import { UploadResponseDto } from 'src/modules/shared/aws-s3/dto/upload-response.dto';
import { Readable } from 'stream';
import { Logger } from 'winston';

type MulterFile = Express.Multer.File;

@Injectable()
export class AwsS3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cloudfrontUrl: string;

  constructor(
    @Inject(s3Configuration.KEY)
    private readonly s3Config: ConfigType<typeof s3Configuration>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.bucket = this.s3Config.awsS3BucketName;
    this.cloudfrontUrl = this.s3Config.cloudFrontUrl;
    const awsConfig: S3ClientConfig = {
      region: this.s3Config?.awsS3Region,
    };
    if (this.s3Config.credentialsRequired) {
      awsConfig.credentials = {
        accessKeyId: this.s3Config?.awsS3AccessKeyId,
        secretAccessKey: this.s3Config?.awsS3SecretAccessKey,
      };
    }
    this.client = new S3Client(awsConfig);
  }

  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    bucketFolder?: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const fileKey = bucketFolder ? `${bucketFolder}/${fileName}` : `${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 300, // 5 minutes
    });

    const fileUrl = `${this.cloudfrontUrl}/${fileKey}`;

    return { uploadUrl, fileUrl };
  }

  async getPresignedDownloadUrl(
    fileKey: string,
    expiresInSeconds: number = 300,
  ): Promise<getPresignedDownloadUrlResponseDto> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });
      const downloadUrl = await getSignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      });

      return {
        presignURL: downloadUrl,
        expiresInSeconds,
      };
    } catch (error) {
      this.logger.error(
        `getPresignedDownloadUrl: Error generating pre-signed download URL for ${fileKey}:`,
        error,
      );
      return null;
    }
  }

  async upload(
    file: MulterFile,
    bucketFolder: string = null,
    contentType: string = undefined,
  ): Promise<UploadResponseDto | null> {
    const originalName = file['originalName'];
    const extension = originalName.split('.').pop();
    const slugOptions = {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true,
      locale: 'en',
      trim: true,
    };
    const nameWithoutExt = originalName.slice(0, -(extension.length + 1));
    const nameConverted = slugify(nameWithoutExt, slugOptions);
    const fileName = `${nameConverted}-${new Date().getTime()}`;
    const fileKey = bucketFolder
      ? `${bucketFolder}/${fileName}.${extension}`
      : `${fileName}.${extension}`;

    try {
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      const inferredContentType =
        contentType || mimeLookup(extension) || 'application/octet-stream';

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: fileKey,
          Body: readableStream,
          ContentType: inferredContentType,
        },
      });

      await upload.done();

      return {
        name: nameConverted,
        extension,
        path: fileKey,
        url: `${this.cloudfrontUrl}/${fileKey}`, // Minh1509
      };
    } catch (err) {
      this.logger.error('upload: ', err);

      return null;
    }
  }

  async remove(fileKey: string) {
    const params = { Bucket: this.bucket, Key: fileKey };
    const cmd = new DeleteObjectCommand(params);
    try {
      const response = await this.client.send(cmd);

      return response;
    } catch (err) {
      this.logger.error('delete: ', err);
      return null;
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const uuid = randomUUID();
    const fileKey = `${folder}/${uuid}-${file.originalname}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.cloudfrontUrl}/${fileKey}`;
  }
}
