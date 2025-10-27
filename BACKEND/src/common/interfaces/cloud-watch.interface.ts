export interface ICloudWatch {
    logEvents: {
        timestamp: number;
        message: string;
    }[];
    logGroupName: string;
    logStreamName: string | undefined;
    sequenceToken: string;
}