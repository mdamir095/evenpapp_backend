import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
export class VendorUserResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Unique key for frontend components' })
  @Expose({ name: 'key' })
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  key: string; 

  @ApiProperty({ description: 'Title of the vendor' })
  @Expose()
  @Transform(({ obj }) => obj.title || obj.name)
  title: string;

  @ApiProperty({ description: 'Description of the vendor' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Detailed long description of the vendor' })
  @Expose()
  longDescription: string;

  @ApiProperty()
  @Expose()
  categoryId: string;

  @ApiProperty()
  @Expose()
  categoryName: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Price of the vendor' })
  @Expose()
  @Transform(({ obj }) => {
    // Return original price from database, or 0 if not available
    // Check multiple possible price sources: direct price, formData.price, formData.fields.Price
    if (obj.price !== undefined && obj.price !== null && obj.price > 0) {
      return obj.price;
    }
    if (obj.formData?.price !== undefined && obj.formData?.price !== null && obj.formData.price > 0) {
      return obj.formData.price;
    }
    if (obj.formData?.fields?.Price) {
      const fieldsPrice = parseFloat(obj.formData.fields.Price);
      if (!isNaN(fieldsPrice) && fieldsPrice > 0) {
        return fieldsPrice;
      }
    }
    // Return 0 if no price found
    return 0;
  })
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

  @ApiProperty({ description: 'Average rating of the vendor' })
  @Expose()
  @Transform(({ obj }) => obj.averageRating || 4.4)
  rating: number;

  @ApiProperty({ description: 'Total number of ratings for the vendor' })
  @Expose()
  @Transform(({ obj }) => obj.totalRatings || 453)
  reviews: number;

  @ApiProperty({ description: "URL of the vendor's image" })
  @Expose()
  @Transform(({ obj }) => {
    // Priority: extracted imageUrl from service > formData.imageUrl > formData.images[0] > vendor.imageUrl > empty string
    // IMPORTANT: Always return a string, never an array
    
    // The service sets imageUrl on the vendor object, so check that first
    if (obj.imageUrl && typeof obj.imageUrl === 'string' && obj.imageUrl !== '') {
      return obj.imageUrl;
    }
    
    // Check formData.imageUrl
    if (obj.formData?.imageUrl && typeof obj.formData.imageUrl === 'string') {
      return obj.formData.imageUrl;
    }
    
    // Check formData.images array
    if (Array.isArray(obj.formData?.images) && obj.formData.images.length > 0) {
      const firstImage = obj.formData.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    
    // Check formData.fields for MultiImageUpload (in case imageUrl wasn't extracted in service)
    if (obj.formData?.fields && Array.isArray(obj.formData.fields)) {
      // Find any field with MultiImageUpload type OR field name containing "image" (case insensitive)
      const imageField = obj.formData.fields.find((field: any) => {
        const isMultiImageUpload = field.type === 'MultiImageUpload';
        const hasImageInName = field.name && field.name.toLowerCase().includes('image');
        const hasActualValue = field.actualValue && Array.isArray(field.actualValue) && field.actualValue.length > 0;
        return (isMultiImageUpload || hasImageInName) && hasActualValue;
      });
      
      if (imageField && imageField.actualValue && imageField.actualValue.length > 0) {
        const firstImage = imageField.actualValue[0];
        // Extract URL from the first image object (index 0) - ensure we return a string, not the object or array
        // This matches the structure: { id: "...", name: "...", url: { imageUrl: "..." } }
        if (firstImage.url && firstImage.url.imageUrl && typeof firstImage.url.imageUrl === 'string') {
          return firstImage.url.imageUrl;
        } else if (firstImage.url && typeof firstImage.url === 'string') {
          return firstImage.url;
        } else if (typeof firstImage === 'string') {
          return firstImage;
        } else if (firstImage.name && typeof firstImage.name === 'string' && firstImage.name.startsWith('http')) {
          return firstImage.name;
        }
      }
    }
    
    // Return empty string instead of hardcoded placeholder
    // NEVER return an array - always return a string
    return '';
  })
  image: string;
}
