export class AwsUploadReqDto {
    Bucket: any;
    Key: string;
    Body: Buffer<ArrayBufferLike>;
    ContentType: string;
}