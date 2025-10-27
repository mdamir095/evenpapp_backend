import { Injectable } from '@nestjs/common';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsSecretsService {
  private secretsManagerClient: SecretsManagerClient;

  constructor(
    private configService: ConfigService
  ) {
    
  }

  async getSecret(secretName: string): Promise<Record<string, any>> {
    try {

        if(secretName=="local.secret"){
          return this.configService.get("mongodb") as Record<string, any>;
        }else{
          return this.configService.get("mongodb") as Record<string, any>; 
            // const command = new GetSecretValueCommand({ SecretId: secretName });
            // this.secretsManagerClient = new SecretsManagerClient({region: process.env.AWS_REGION});
            // const response = await this.secretsManagerClient.send(command);
            // if (response.SecretString) {
            //   return JSON.parse(response.SecretString);
            // }
        }

      // throw new Error('SecretString is empty');
    } catch (error) {
      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }
}
