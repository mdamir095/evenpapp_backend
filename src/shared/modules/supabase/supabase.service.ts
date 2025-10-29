import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const key = this.configService.get<string>('supabase.serviceKey') || this.configService.get<string>('supabase.publicAnonKey');
    this.defaultBucket = this.configService.get<string>('supabase.storageBucket') || 'uploads';

    if (!url || !key) {
      throw new BadRequestException('Supabase configuration missing. Please set supabase.url and supabase.serviceKey/publicAnonKey.');
    }

    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getBucket(bucket?: string) {
    const useBucket = bucket || this.defaultBucket;
    return this.client.storage.from(useBucket);
  }

  async upload(params: {
    filePath: string; // path/key inside the bucket
    file: Buffer | ArrayBuffer | Blob | Uint8Array;
    contentType?: string;
    bucket?: string;
    upsert?: boolean;
  }): Promise<{ path: string; publicUrl?: string }>{
    const { filePath, file, contentType, bucket, upsert } = params;
    const storage = this.getBucket(bucket);
    const options: any = {};
    if (contentType) options.contentType = contentType;
    if (typeof upsert === 'boolean') options.upsert = upsert;

    const { data, error } = await storage.upload(filePath, file as any, options);
    if (error) throw new BadRequestException(error.message);

    const { data: pub } = storage.getPublicUrl(data.path);
    return { path: data.path, publicUrl: pub.publicUrl };
  }

  async remove(params: { paths: string[]; bucket?: string }): Promise<void> {
    const { paths, bucket } = params;
    const storage = this.getBucket(bucket);
    const { error } = await storage.remove(paths);
    if (error) throw new BadRequestException(error.message);
  }

  async download(params: { path: string; bucket?: string }): Promise<Buffer> {
    const { path, bucket } = params;
    const storage = this.getBucket(bucket);
    const { data, error } = await storage.download(path);
    if (error) throw new BadRequestException(error.message);
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  getPublicUrl(params: { path: string; bucket?: string }): string {
    const { path, bucket } = params;
    const storage = this.getBucket(bucket);
    const { data } = storage.getPublicUrl(path);
    return data.publicUrl;
  }
}


