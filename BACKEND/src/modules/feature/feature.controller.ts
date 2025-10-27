import { Controller } from '@nestjs/common';
import { FeatureService } from './feature.service';


@Controller('features')

export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}
}


