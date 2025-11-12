import { Injectable } from '@nestjs/common';
import { VendorService } from '../vendor/vendor.service';
import { VenueService } from '../venue/venue.service';
import { VendorPaginatedResponseDto } from '../vendor/dto/response/vendor-paginated.dto';
import { VendorPaginationDto } from '../vendor/dto/request/vendor-pagination.dto';
import { VenuePaginatedResponseDto } from '../venue/dto/response/venue-paginated.dto';
import { VenuePaginationDto } from '../venue/dto/request/venue-pagination.dto';

@Injectable()
export class SimilarService {
  constructor(
    private readonly vendorService: VendorService,
    private readonly venueService: VenueService,
  ) {}

  async getSimilarVendors(paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    return this.vendorService.findAll(paginationDto);
  }

  async getSimilarVenues(paginationDto: VenuePaginationDto): Promise<VenuePaginatedResponseDto> {
    return this.venueService.findAll(paginationDto);
  }
}

