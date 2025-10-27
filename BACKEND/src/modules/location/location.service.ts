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

  async findNearby(lng: number, lat: number, radiusMeters = 5000, type?: 'vendor' | 'venue') {
    try {
      const results = [];
      let totalVendors = 0;
      let vendorsWithCoords = 0;
      let vendorsInRadius = 0;

      // Query vendors if type is not specified or is 'vendor'
      if (!type || type === 'vendor') {
        const vendors = await this.vendorRepo.find({
          where: { isDeleted: false }
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
            results.push({
              id: vendor.id.toString(),
              title: vendor.title || vendor.name,
              price: vendor.price || 150.00,
              rating: vendor.averageRating || 4.4,
              reviews: vendor.totalRatings || 453,
              image: vendor.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZBdgFa0P0zkOM4y4FawsIT3Kc_Pp5FucS5CrSndvKMuLywrk9nRvhIBQBbUExCPTk-ss&usqp=CAU',
              distance: Math.round(distance), // Add distance in meters
              coordinates: coords // Add coordinates for debugging
            });
          }
        }
      }

      // Query venues if type is not specified or is 'venue'
      if (!type || type === 'venue') {
        const venues = await this.venueRepo.find({
          where: { isDeleted: false }
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
            results.push({
              id: venue.id.toString(),
              title: venue.title || venue.name,
              price: venue.price || 150.00,
              rating: venue.averageRating || 4.4,
              reviews: venue.totalRatings || 453,
              image: venue.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZBdgFa0P0zkOM4y4FawsIT3Kc_Pp5FucS5CrSndvKMuLywrk9nRvhIBQBbUExCPTk-ss&usqp=CAU',
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
          searchParams: { lng, lat, radiusMeters, type }
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

