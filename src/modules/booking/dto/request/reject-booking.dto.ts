import { IsString, IsNotEmpty, IsOptional, ValidateIf, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'hasRejectionReason', async: false })
export class HasRejectionReasonConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as RejectBookingDto;
    return !!(object.rejectionReason || object.reason);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either rejectionReason or reason must be provided';
  }
}

export class RejectBookingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Booking ID',
    example: 'BK-A9098A0F',
    required: true,
  })
  bookingId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'rejectionReason must not be empty if provided' })
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Venue not available on requested date',
    required: false,
  })
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'reason must not be empty if provided' })
  @ApiProperty({
    description: 'Reason for rejection (alternative to rejectionReason)',
    example: 'Venue not available on requested date',
    required: false,
  })
  reason?: string;

  @Validate(HasRejectionReasonConstraint)
  _validateRejectionReason: any;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional notes for rejection',
    example: 'Please consider alternative dates',
    required: false,
  })
  notes?: string;
}

