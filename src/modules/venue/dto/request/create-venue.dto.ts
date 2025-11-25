import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsObject, IsNotEmpty, IsOptional, IsArray } from "class-validator";
import { Transform } from "class-transformer";

export class CreateVenueDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'The service category ObjectId of the venue',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  serviceCategoryId?: string;

  @ApiProperty({ 
    example: 'Grand Wedding Hall', 
    description: 'The name of the venue',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    example: 'Euphoria spa & Beauty lounge unisex', 
    description: 'The title of the venue. If not provided, will default to the name field.',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ 
    example: 'Beautiful venue for weddings and events',
    description: 'The description of the venue',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 'Our venue is a magnificent wedding hall located in the heart of the city, offering a perfect blend of traditional elegance and modern amenities. With a spacious capacity of 500+ guests, our venue features a grand entrance, beautifully decorated halls, and state-of-the-art facilities including air conditioning, high-quality sound systems, and professional lighting. We provide comprehensive wedding services including catering, decoration, photography coordination, and event management. Our experienced team ensures every detail is taken care of to make your special day truly memorable. The venue is easily accessible with ample parking space and is located near major hotels and transportation hubs.', 
    description: 'Detailed long description about the venue and its facilities' 
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({ 
    example: {
      location: "123 Main Street, Mumbai",
      capacity: 500,
      pricing: 75000,
      amenities: ["WiFi", "Parking", "AC"],
      features: ["Stage", "Sound System"],
      contactEmail: "venue@example.com",
      contactPhone: "+91-9876543210",
      availability: {
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      },
      images: ["image1.jpg", "image2.jpg"],
      description: "Beautiful venue for weddings and events"
    },
    description: 'Dynamic form data containing any custom fields as defined by the venue category form. This can include location, capacity, pricing, amenities, etc. If not provided, will default to an empty object.',
    required: false
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    // If it's already an object, return it
    if (typeof value === 'object') return value;
    // If it's a string, try to parse it as JSON
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Failed to parse formData JSON string:', e);
        return undefined;
      }
    }
    return value;
  })
  @IsObject()
  @IsOptional()
  formData?: Record<string, any>;

  @ApiProperty({ 
    example: [
      {
        name: 'Wedding Hall',
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...']
      },
      {
        name: 'Reception Area',
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...']
      }
    ],
    description: 'Array of albums with images for the venue',
    required: false
  })
  @IsArray()
  @IsOptional()
  albums?: Array<{
    name: string;
    images: string[];
  }>;

  @ApiProperty({ 
    example: '68a43786a078621f98514e67', 
    description: 'The enterprise ID associated with this venue (auto-populated for Enterprise users)',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  enterpriseId?: string;

  @ApiProperty({ 
    example: 'Supertech', 
    description: 'The enterprise name associated with this venue (auto-populated for Enterprise users)',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  enterpriseName?: string;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439013', 
    description: 'The user ID who created this venue',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
  