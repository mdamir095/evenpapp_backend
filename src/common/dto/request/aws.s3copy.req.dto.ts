export class AwsS3CopyReqDto {
    Bucket: string;
    Key: string;
    CopySource:string;
    szFileName?:Buffer<ArrayBufferLike>; 
}