import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Location } from './entity/location.entity';
import { CreateLocationDto } from './dto/request/create-location.dto';
import { UpdateLocationDto } from './dto/request/update-location.dto';
import { ObjectId } from 'mongodb';
import { Vendor } from '../vendor/entity/vendor.entity';
import { Venue } from '../venue/entity/venue.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location, 'mongo')
    private readonly repo: MongoRepository<Location>,
    @InjectRepository(Vendor, 'mongo')
    private readonly vendorRepo: MongoRepository<Vendor>,
    @InjectRepository(Venue, 'mongo')
    private readonly venueRepo: MongoRepository<Venue>,
  ) {}

  async findByServiceId(serviceId: string): Promise<Location | null> {
    if (!serviceId) return null;
    return this.repo.findOne({ where: { serviceId } });
  }

  async create(dto: CreateLocationDto) {
    const entity = this.repo.create(dto);
    if (dto.latitude != null && dto.longitude != null) {
      (entity as any).geo = { type: 'Point', coordinates: [dto.longitude, dto.latitude] };
    }
    return this.repo.save(entity);
  }

  async findAll(page = 1, limit = 10, serviceId?: string) {
    const where: any = {};
    if (serviceId) where.serviceId = serviceId;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) throw new NotFoundException('Location not found');
    return entity;
  }

  async update(id: string, dto: UpdateLocationDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    if (dto.latitude != null && dto.longitude != null) {
      (entity as any).geo = { type: 'Point', coordinates: [dto.longitude, dto.latitude] };
    }
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.delete(entity.id as any);
    return { message: 'Location deleted successfully' };
  }

  // Helper function to calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper function to extract coordinates from formData
  private extractCoordinates(formData: any): { lat: number; lng: number } | null {
    if (!formData) return null;
    
    // Try different possible location formats in formData
    if (formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (!isNaN(lat) && !isNaN(lng) && this.isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }
    
    if (formData.lat && formData.lng) {
      const lat = parseFloat(formData.lat);
      const lng = parseFloat(formData.lng);
      if (!isNaN(lat) && !isNaN(lng) && this.isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }
    
    if (formData.location && typeof formData.location === 'string') {
      // Try to parse coordinates from location string (e.g., "lat,lng" or "lat, lng")
      const coords = formData.location.split(',').map((s: string) => parseFloat(s.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]) && this.isValidCoordinate(coords[0], coords[1])) {
        return { lat: coords[0], lng: coords[1] };
      }
    }
    
    // Try nested coordinate objects
    if (formData.coordinates) {
      if (formData.coordinates.latitude && formData.coordinates.longitude) {
        const lat = parseFloat(formData.coordinates.latitude);
        const lng = parseFloat(formData.coordinates.longitude);
        if (!isNaN(lat) && !isNaN(lng) && this.isValidCoordinate(lat, lng)) {
          return { lat, lng };
        }
      }
      if (formData.coordinates.lat && formData.coordinates.lng) {
        const lat = parseFloat(formData.coordinates.lat);
        const lng = parseFloat(formData.coordinates.lng);
        if (!isNaN(lat) && !isNaN(lng) && this.isValidCoordinate(lat, lng)) {
          return { lat, lng };
        }
      }
    }
    
    // If no valid coordinates found, return null
    // This ensures only vendors/venues with proper coordinates are included in results
    return null;
  }

  // Helper function to validate if coordinates are within valid ranges
  private isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Helper function to extract image URL from formData (similar to vendor/venue listing endpoints)
  private extractImageUrl(entity: any): string {
    if (!entity) return '';
    
    // Start with direct imageUrl
    let imageUrl = entity.imageUrl || entity.formData?.imageUrl || entity.formData?.images?.[0] || '';
    
    // Extract from formData.fields if it exists (for MultiImageUpload fields)
    if (entity.formData?.fields && Array.isArray(entity.formData.fields)) {
      const imageField = entity.formData.fields.find((field: any) => 
        field.type === 'MultiImageUpload' && 
        field.actualValue && 
        Array.isArray(field.actualValue) && 
        field.actualValue.length > 0
      );
      
      if (imageField && imageField.actualValue && imageField.actualValue.length > 0) {
        const firstImage = imageField.actualValue[0];
        // Check for url.imageUrl structure
        if (firstImage.url && firstImage.url.imageUrl) {
          imageUrl = firstImage.url.imageUrl;
        } else if (typeof firstImage === 'string') {
          imageUrl = firstImage;
        } else if (firstImage.url) {
          imageUrl = firstImage.url;
        }
      }
    }
    
    // Return the extracted image URL, or empty string if not found
    return imageUrl && imageUrl.trim() !== '' ? imageUrl : '';
  }

  // Helper function to extract price from formData
  // Priority: formData.fields (field name is "price") > entity.price > formData.price > other formData locations
  private extractPriceFromFormData(entity: any): number {
    if (!entity) return 0;
    
    // PRIORITY 1: Check formData.fields array for field with name exactly "price" (case-insensitive)
    if (entity.formData?.fields && Array.isArray(entity.formData.fields)) {
      // First, try to find field with name exactly "price" (case-insensitive)
      const priceField = entity.formData.fields.find((field: any) => {
        const fieldName = field?.name?.toLowerCase() || '';
        const isExactPriceField = fieldName === 'price';
        const hasActualValue = field?.actualValue !== undefined && field?.actualValue !== null && field?.actualValue !== '';
        return isExactPriceField && hasActualValue;
      });
      
      if (priceField && priceField.actualValue !== undefined && priceField.actualValue !== null) {
        const priceValue = typeof priceField.actualValue === 'string' 
          ? parseFloat(priceField.actualValue) 
          : typeof priceField.actualValue === 'number' 
            ? priceField.actualValue 
            : 0;
        if (!isNaN(priceValue) && priceValue >= 0) {
          return priceValue;
        }
      }
      
      // If exact "price" field not found, try fields with "price" in the name (case insensitive)
      const priceFieldWithName = entity.formData.fields.find((field: any) => {
        const fieldName = field?.name?.toLowerCase() || '';
        const hasPriceInName = fieldName.includes('price');
        const hasActualValue = field?.actualValue !== undefined && field?.actualValue !== null && field?.actualValue !== '';
        return hasPriceInName && hasActualValue;
      });
      
      if (priceFieldWithName && priceFieldWithName.actualValue !== undefined && priceFieldWithName.actualValue !== null) {
        const priceValue = typeof priceFieldWithName.actualValue === 'string' 
          ? parseFloat(priceFieldWithName.actualValue) 
          : typeof priceFieldWithName.actualValue === 'number' 
            ? priceFieldWithName.actualValue 
            : 0;
        if (!isNaN(priceValue) && priceValue >= 0) {
          return priceValue;
        }
      }
      
      // Also check for direct Price field (capital P) - fields might be an object too
      if (entity.formData.fields.Price) {
        const fieldsPrice = parseFloat(entity.formData.fields.Price);
        if (!isNaN(fieldsPrice) && fieldsPrice >= 0) {
          return fieldsPrice;
        }
      }
    }
    
    // PRIORITY 2: Check entity.price (direct field)
    if (entity.price !== undefined && entity.price !== null && entity.price >= 0) {
      return entity.price;
    }
    
    // PRIORITY 3: Check formData.price (direct field in formData)
    if (entity.formData?.price !== undefined && entity.formData?.price !== null && entity.formData.price >= 0) {
      return entity.formData.price;
    }
    
    // PRIORITY 4: Check formData.pricing.starting
    if (entity.formData?.pricing?.starting && typeof entity.formData.pricing.starting === 'number' && entity.formData.pricing.starting >= 0) {
      return entity.formData.pricing.starting;
    }
    
    // PRIORITY 5: Check formData.pricing as a number
    if (entity.formData?.pricing && typeof entity.formData.pricing === 'number' && entity.formData.pricing >= 0) {
      return entity.formData.pricing;
    }
    
    // Fallback to 0 if no price found
    return 0;
  }

  async findNearby(lng: number, lat: number, radiusMeters = 5000, type?: 'vendor' | 'venue') {
    try {
      const results = [];
      let totalVendors = 0;
      let vendorsWithCoords = 0;
      let vendorsInRadius = 0;

      // Default to 'vendor' if type is not specified - only return vendor services
      const searchType = type || 'vendor';

      // Query vendors if type is 'vendor' (default)
      if (searchType === 'vendor') {
        const vendors = await this.vendorRepo.find({
          where: { isDeleted: false },
          // Explicitly select formData to ensure it's loaded for price extraction
          select: {
            _id: true,
            id: true,
            name: true,
            title: true,
            price: true,
            formData: true, // Explicitly select formData
            imageUrl: true,
            averageRating: true,
            totalRatings: true,
            isDeleted: true,
            isActive: true,
          } as any,
        });
        totalVendors = vendors.length;

        for (const vendor of vendors) {
          // First try to get coordinates from the locations collection using serviceId
          let coords = null;
          
          // Look for location data using vendor ID as serviceId
          const location = await this.repo.findOne({
            where: { 
              serviceId: vendor.id.toString(),
              isDeleted: false,
              isActive: true
            }
          });
          
          if (location && location.latitude && location.longitude) {
            coords = { lat: location.latitude, lng: location.longitude };
          } else {
            // Fallback to formData if no location record found
            coords = this.extractCoordinates(vendor.formData);
          }
          
          // If no coordinates found, skip this vendor
          if (!coords) continue;
          vendorsWithCoords++;
          
          // Calculate distance
          const distance = this.calculateDistance(lat, lng, coords.lat, coords.lng);
          
          // Only include if within radius
          if (distance <= radiusMeters) {
            vendorsInRadius++;
            // Extract image URL dynamically from formData
            const imageUrl = this.extractImageUrl(vendor);
            // Extract price dynamically from formData (prioritizing field with name "price")
            const price = this.extractPriceFromFormData(vendor);
            
            results.push({
              id: vendor.id.toString(),
              title: vendor.title || vendor.name,
              price: price,
              rating: vendor.averageRating || 4.4,
              reviews: vendor.totalRatings || 453,
              image: imageUrl, // Use dynamically extracted image
              distance: Math.round(distance), // Add distance in meters
              coordinates: coords // Add coordinates for debugging
            });
          }
        }
      }

      // Query venues only if type is explicitly 'venue'
      if (searchType === 'venue') {
        const venues = await this.venueRepo.find({
          where: { isDeleted: false },
          // Explicitly select formData to ensure it's loaded for price extraction
          select: {
            _id: true,
            id: true,
            name: true,
            title: true,
            price: true,
            formData: true, // Explicitly select formData
            imageUrl: true,
            averageRating: true,
            totalRatings: true,
            isDeleted: true,
            isActive: true,
          } as any,
        });

        for (const venue of venues) {
          // First try to get coordinates from the locations collection using serviceId
          let coords = null;
          
          // Look for location data using venue ID as serviceId
          const location = await this.repo.findOne({
            where: { 
              serviceId: venue.id.toString(),
              isDeleted: false,
              isActive: true
            }
          });
          
          if (location && location.latitude && location.longitude) {
            coords = { lat: location.latitude, lng: location.longitude };
          } else {
            // Fallback to formData if no location record found
            coords = this.extractCoordinates(venue.formData);
          }
          
          // If no coordinates found, skip this venue
          if (!coords) continue;
          
          // Calculate distance
          const distance = this.calculateDistance(lat, lng, coords.lat, coords.lng);
          
          // Only include if within radius
          if (distance <= radiusMeters) {
            // Extract image URL dynamically from formData
            const imageUrl = this.extractImageUrl(venue);
            // Extract price dynamically from formData (prioritizing field with name "price")
            const price = this.extractPriceFromFormData(venue);
            
            results.push({
              id: venue.id.toString(),
              title: venue.title || venue.name,
              price: price,
              rating: venue.averageRating || 4.4,
              reviews: venue.totalRatings || 453,
              image: imageUrl, // Use dynamically extracted image
              distance: Math.round(distance), // Add distance in meters
              coordinates: coords // Add coordinates for debugging
            });
          }
        }
      }

      // Sort by distance (closest first)
      results.sort((a, b) => a.distance - b.distance);

      return {
        results,
        total: results.length,
        searchLocation: { lat, lng },
        radius: radiusMeters,
        debug: {
          totalVendors,
          vendorsWithCoords,
          vendorsInRadius,
          searchParams: { lng, lat, radiusMeters, type: searchType }
        }
      };
    } catch (error) {
      console.error('Error in findNearby:', error);
      throw new Error(`Failed to find nearby locations: ${error.message}`);
    }
  }

  async deleteByServiceId(serviceId: string) {
    // delete only one location
    const location = await this.repo.findOne({ where: { serviceId } });
    if (!location) throw new NotFoundException('Location not found');
    await this.repo.delete(location.id as any);
    return { message: 'Location deleted successfully' };
  }
}

