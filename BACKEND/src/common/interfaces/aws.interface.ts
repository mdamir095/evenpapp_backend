export interface IAws{    
    maxAttempts: number;
    params?: {
        Bucket: string;
    };
    httpOptions: {
        timeout: number;
        connectTimeout: number;
    };
    region: string;
    credentials?: {
        accessKeyId: string,
        secretAccessKey: string,
    };  

}