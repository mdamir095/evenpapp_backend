import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export class EncryptionUtil {
  constructor(
    private readonly configService: ConfigService
) {}

  private algorithm = this.configService.get("cryptoSecret.algorithm");
  private key = Buffer.from(this.configService.get('cryptoSecret.key'), 'hex'); // 32 bytes
  private iv = Buffer.from(this.configService.get('cryptoSecret.iv'), 'hex');   // 16 bytes

  encryptToken(token: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptToken(encryptedToken: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

}
