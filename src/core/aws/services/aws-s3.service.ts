import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { IAws } from '../../../common/interfaces/aws.interface';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { Readable } from 'stream';
import { LoggerService } from '@core/logger/logger.service';
import { AwsReqDto } from '@common/dto/request/aws.req.dto';
import { Upload } from '@aws-sdk/lib-storage';
import { ICloudWatch } from '@common/interfaces/cloud-watch.interface';
import { AwsS3CopyReqDto } from '@common/dto/request/aws.s3copy.req.dto';
import { AwsUploadReqDto } from '@common/dto/request/aws-upload.req.dto';



@Injectable()
export class AwsS3Service {
  private awsConfig;
  constructor(
    private configService: ConfigService,
    private readonly loggerService: LoggerService
  ) {
    this.awsConfig = this.configService.get('aws');
  }
  async cloudwatchlogs(arParams: any, name: string) {
    this.loggerService.log(`[${AwsS3Service.name}::cloudwatchlogs] awsS3Configration method called`);
    let environment = process.env.NODE_ENV;
    let config: IAws = {
      maxAttempts: 1,
      httpOptions: {
        timeout: 30000,
        connectTimeout: 5000
      },
      region: this.awsConfig.regionName
    }
    if (environment == "local") {
      const configFilePath = path.join(__dirname, '../keys');
      const jsonString = fs.readFileSync(configFilePath, 'utf-8');
      const secret = JSON.parse(jsonString);
      config.credentials = {
        accessKeyId: secret.accessKeyId,
        secretAccessKey: secret.secretAccessKey,
      };
    }
    const cloudwatchlogs = new CloudWatchLogs(config);
    this.loggerService.log(`[${AwsS3Service.name}::cloudwatchlogs] createLogStream method called`);
    let result = await this.createLogStream(name, config);
    if (result) {
      let params: ICloudWatch = {
        logEvents: [
          {
            "timestamp": new Date().valueOf(),
            "message": JSON.stringify(arParams)
          },
        ],
        logGroupName: this.awsConfig.logGroupName,
        logStreamName: result.streamName,
        sequenceToken: result.sequenceToken
      };
      this.loggerService.log(`[${AwsS3Service.name}::cloudwatchlogs] putLogEvents method called`);
      const data =await cloudwatchlogs.putLogEvents(params);
      return data;

    }

  }
  async awsS3Configration(bucket: string) {
    let environment = process.env.NODE_ENV;
    let config: IAws = {
      maxAttempts: 1,
      params: {
        Bucket: bucket
      },
      httpOptions: {
        timeout: 30000,
        connectTimeout: 5000
      },
      region: this.awsConfig.regionName
    }
    if (environment == "local") {
      // const configFilePath = path.join(__dirname, '../keys');
      // const jsonString = fs.readFileSync(configFilePath, 'utf-8');
      // const secret = JSON.parse(jsonString);
      config.credentials = {
        // accessKeyId: secret.accessKeyId,
        // secretAccessKey: secret.secretAccessKey,
        accessKeyId: "AKIA52JBVXHFBSPG4DFI",
        secretAccessKey:  "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", 
      };
    }
    this.loggerService.log(`[${AwsS3Service.name}::awsS3Configration] return the aws configration`);
    return config;

  }
  async createLogStream(name: string, config: IAws) {
    this.loggerService.log(`[${AwsS3Service.name}::createLogStream] CloudWatchLogs method called`);
    const cloudwatchlogs = new CloudWatchLogs(config);
    let datetime = new Date();
    let streamName = name + (datetime.toISOString().slice(0, 10)).split('-').join('');
    let describeLogParams = {
      logGroupName: this.awsConfig.logGroupName,
      logStreamNamePrefix: streamName
    };
    this.loggerService.log(`[${AwsS3Service.name}::createLogStream] describeLogStreams method called`);
    const describeLogData = await cloudwatchlogs.describeLogStreams(describeLogParams);
    if (describeLogData.logStreams && describeLogData.logStreams[0]) {
      return {
        sequenceToken: describeLogData.logStreams[0].uploadSequenceToken || "",
        streamName: describeLogData.logStreams[0].logStreamName,
      };
    } else {
      const createLogParams = {
        logGroupName: this.awsConfig.logGroupName,
        logStreamName: streamName,
      };
      this.loggerService.log(`[${AwsS3Service.name}::createLogStream] createLogStream method called`);
      await cloudwatchlogs.createLogStream(createLogParams);
      return {
        sequenceToken: "",
        streamName: streamName,
      };
    }
  }

  async uploadFilesToS3Bucket(arParams: AwsUploadReqDto) {
    this.loggerService.log(`[${AwsS3Service.name}::uploadFilesToS3Bucket] awsS3Configration method called`);
    let config = await this.awsS3Configration(arParams.Bucket);
    const s3 = new S3(config);
    this.loggerService.log(`[${AwsS3Service.name}::uploadFilesToS3Bucket] Upload method called`);
    const data = await new Upload({ client: s3, params: arParams }).done();
    return data;
  }

  async copyFilesFromS3Bucket(arParams: AwsS3CopyReqDto) {
    this.loggerService.log(`[${AwsS3Service.name}::copyFilesFromS3Bucket] awsS3Configration method called`);
    let config = await this.awsS3Configration(arParams.Bucket);
    const s3 = new S3(config);
    this.loggerService.log(`[${AwsS3Service.name}::copyFilesFromS3Bucket] Upload method called`);
    return await s3.copyObject(arParams);
  }
  async getAllFilesFromS3Bucket(arParams: AwsReqDto) {
    this.loggerService.log(`[${AwsS3Service.name}::getAllFilesFromS3Bucket] awsS3Configration method called`);
    let config = await this.awsS3Configration(arParams.Bucket);
    const s3 = new S3(config);
    this.loggerService.log(`[${AwsS3Service.name}::getAllFilesFromS3Bucket] listObjectsV2 method called`);
    const data = await s3.listObjectsV2({
      Bucket: arParams.Bucket,
      Prefix: arParams.Key,
    });
    return data?.Contents;
  }
  async deleteFilesFromS3Bucket(arParams: AwsReqDto) {
    this.loggerService.log(`[${AwsS3Service.name}::deleteFilesFromS3Bucket] awsS3Configration method called`);
    let config = await this.awsS3Configration(arParams.Bucket);
    const s3 = new S3(config);
    this.loggerService.log(`[${AwsS3Service.name}::deleteFilesFromS3Bucket] deleteObject method called`);
    const data = await s3.deleteObject(arParams);
    return data;
  }
  async downloadFilesFromS3Bucket(arParams: AwsReqDto) {
    this.loggerService.log(`[${AwsS3Service.name}::downloadFilesFromS3Bucket] awsS3Configration method called`);
    let config = await this.awsS3Configration(arParams.Bucket);
    const s3 = new S3(config);
    let s3Object = {
      Bucket: arParams.Bucket,
      Key: arParams.Key,
    }
    this.loggerService.log(`[${AwsS3Service.name}::downloadFilesFromS3Bucket] GetObjectCommand method called`);
    const command = await new GetObjectCommand(s3Object);
    const response = await s3.send(command);
    const responseDataChunks: Uint8Array[] = [];
    const readable = response.Body as Readable;
    return new Promise<Buffer>((resolve, reject) => {
      readable.once("error", (err) => reject(err));
      readable.on("data", (chunk) => responseDataChunks.push(chunk));
      readable.once("end", () => resolve(arParams.szFileName));
    });
  }
  async downloadExcelFromS3Bucket(arParams: AwsReqDto) {
    this.loggerService.log(`[${AwsS3Service.name}::downloadExcelFromS3Bucket] awsS3Configration method called`);
    let config = await this.awsS3Configration(arParams.Bucket);
    const s3 = new S3(config);
    let s3Object = {
      Bucket: arParams.Bucket,
      Key: arParams.Key,
    }
    this.loggerService.log(`[${AwsS3Service.name}::downloadExcelFromS3Bucket] GetObjectCommand method called`);
    const command = await new GetObjectCommand(s3Object);
    const response = await s3.send(command);
    const responseDataChunks: Uint8Array[] = [];
    const readable = response.Body as Readable;
    return new Promise<Buffer>((resolve, reject) => {
      readable.once("error", (err) => reject(err));
      readable.on("data", (chunk) => responseDataChunks.push(chunk));
      readable.once("end", () => resolve(Buffer.concat(responseDataChunks)));
    });

  }
}


