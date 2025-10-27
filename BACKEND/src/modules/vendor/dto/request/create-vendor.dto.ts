import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsObject, IsNotEmpty, IsOptional, IsArray } from "class-validator";

export class CreateVendorDto {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    description: 'The category ObjectId of the vendor' 
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ 
    example: 'Elite Wedding Photographers', 
    description: 'The name of the vendor' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'Euphoria spa & Beauty lounge unisex', 
    description: 'The title of the vendor' 
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: 'Professional wedding photography services with years of experience', 
    description: 'The description of the vendor' 
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: 'We are a professional wedding photography team with over 8 years of experience in capturing beautiful moments. Our team specializes in candid photography, traditional ceremonies, and modern wedding styles. We provide comprehensive wedding photography services including pre-wedding shoots, engagement sessions, wedding day coverage, and post-wedding editing. Our portfolio includes over 500+ successful weddings across Mumbai, Pune, and surrounding areas. We use state-of-the-art equipment including DSLR cameras, drones for aerial shots, and professional lighting setups to ensure every moment is captured perfectly.', 
    description: 'Detailed long description about the vendor and their services' 
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({ 
    example: {
      location: "Mumbai, Maharashtra",
      experience: 5,
      pricing: {
        starting: 25000,
        premium: 75000
      },
      services: ["Wedding Photography", "Pre-wedding Shoot", "Candid Photography"],
      equipment: ["DSLR Camera", "Drone", "Lighting Equipment"],
      contactDetails: {
        phone: "+91-9876543210",
        email: "contact@elitephotographers.com",
        website: "www.elitephotographers.com"
      },
      availability: {
        weekdays: true,
        weekends: true,
        advance_booking_days: 30
      },
      portfolio: ["image1.jpg", "image2.jpg", "video1.mp4"],
      packages: [
        {
          name: "Basic Package",
          price: 25000,
          description: "4-hour photography session",
          features: ["200 edited photos", "Online gallery", "Basic album"]
        },
        {
          name: "Premium Package",
          price: 75000,
          description: "Full day photography with videography",
          features: ["500 edited photos", "Cinematic video", "Premium album", "Online gallery"]
        }
      ],
      certifications: ["Professional Photography Diploma"],
      languages: ["Hindi", "English", "Marathi"],
      coverage_areas: ["Mumbai", "Pune", "Nashik"],
      business_hours: {
        start: "09:00",
        end: "21:00"
      },
      team_size: 3,
      years_in_business: 8
    },
    description: 'Dynamic form data containing any custom fields as defined by the vendor category form. This can include location, services, pricing, availability, etc.'
  })
  @IsObject()
  @IsNotEmpty()
  formData: Record<string, any>;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439012', 
    description: 'The enterprise ID associated with this vendor (required for Admin users, auto-populated for Enterprise users)',
    required: false
  })
  @IsString()
  @IsOptional()
  enterpriseId?: string;

  @ApiProperty({ 
    example: 'Acme Corporation', 
    description: 'The enterprise name associated with this vendor (auto-populated for Enterprise users)',
    required: false
  })
  @IsString()
  @IsOptional()
  enterpriseName?: string;

  @ApiProperty({ 
    example: [
      {
        name: 'Wedding Ceremony',
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...']
      },
      {
        name: 'Reception',
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...']
      }
    ],
    description: 'Array of albums with images for the vendor',
    required: false
  })
  @IsArray()
  @IsOptional()
  albums?: Array<{
    name: string;
    images: string[];
  }>;
}