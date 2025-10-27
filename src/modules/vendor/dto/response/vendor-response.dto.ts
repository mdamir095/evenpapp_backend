import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

class LocationDto {
  @ApiProperty({ description: 'Full address' })
  @Expose()
  address: string;

  @ApiProperty({ description: 'City name' })
  @Expose()
  city: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @Expose()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @Expose()
  longitude: number;

  @ApiProperty({ description: 'Pin title for map' })
  @Expose()
  pinTitle: string;

  @ApiProperty({ description: 'Map image URL' })
  @Expose()
  mapImageUrl: string;
}

export class VendorResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Category ObjectId of the vendor' })
  @Expose()
  categoryId: string;

  @ApiProperty({ description: 'Category Name of the vendor' })
  @Expose()
  categoryName: string;

  @ApiProperty({ description: 'Name of the vendor' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Title of the vendor' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Description of the vendor' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Detailed long description of the vendor' })
  @Expose()
  longDescription: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  location: LocationDto;

  @ApiProperty({ description: 'Price of the vendor' })
  @Expose()
  price: number;

  @ApiProperty({ 
    description: 'Dynamic pricing array based on category',
    example: [
      { title: 'Drone Coverage', price: 2000 },
      { title: 'Pre Wedding Shoot', price: 5000 },
      { title: 'Portrait Shoot', price: 400 }
    ]
  })
  @Expose()
  pricing: Array<{
    title: string;
    price: number;
  }>;

  @ApiProperty({ 
    description: 'Dynamic form data containing vendor details',
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
        }
      ],
      certifications: ["Professional Photography Diploma"],
      languages: ["Hindi", "English", "Marathi"],
      coverage_areas: ["Mumbai", "Pune", "Nashik"]
    }
  })
  @Expose()
  formData: Record<string, any>;

  @ApiProperty({ description: 'Enterprise ID associated with this vendor' })
  @Expose()
  enterpriseId: string;

  @ApiProperty({ description: 'Enterprise name associated with this vendor' })
  @Expose()
  enterpriseName: string;

}