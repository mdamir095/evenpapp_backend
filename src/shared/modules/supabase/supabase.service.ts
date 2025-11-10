import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null;
  private defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultBucket = this.configService.get<string>('supabase.storageBucket') || 'uploads';
    this.client = null;
    
    try {
      const url = this.configService.get<string>('supabase.url');
      const key = this.configService.get<string>('supabase.serviceKey') || this.configService.get<string>('supabase.publicAnonKey');

      if (!url || !key) {
        console.warn('⚠️ Supabase configuration missing. Supabase uploads will not be available.');
        console.warn('⚠️ Please set supabase.url and supabase.serviceKey/publicAnonKey in your configuration.');
        return;
      }

      this.client = createClient(url, key);
      console.log('✅ Supabase service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Supabase service:', error);
      this.client = null;
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  isAvailable(): boolean {
    return this.client !== null && this.client !== undefined;
  }

  getBucket(bucket?: string) {
    if (!this.client) {
      throw new BadRequestException('Supabase client is not initialized. Please check your Supabase configuration.');
    }
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
    if (!this.isAvailable()) {
      throw new BadRequestException('Supabase is not configured. Please set supabase.url and supabase.serviceKey/publicAnonKey.');
    }

    const { filePath, file, contentType, bucket, upsert } = params;
    try {
      const storage = this.getBucket(bucket);
      const options: any = {};
      if (contentType) options.contentType = contentType;
      if (typeof upsert === 'boolean') options.upsert = upsert;

      const { data, error } = await storage.upload(filePath, file as any, options);
      if (error) {
        console.error('Supabase upload error:', error);
        throw new BadRequestException(`Supabase upload failed: ${error.message}`);
      }

      const { data: pub } = storage.getPublicUrl(data.path);
      return { path: data.path, publicUrl: pub.publicUrl };
    } catch (error: any) {
      console.error('Supabase upload exception:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Wrap other errors
      throw new BadRequestException(`Supabase upload failed: ${error?.message || 'Unknown error'}`);
    }
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


