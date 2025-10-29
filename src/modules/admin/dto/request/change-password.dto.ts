import { IsString, MinLength, Matches, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return confirmPassword === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'New password and confirm password do not match';
  }
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword@123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Must contain at least one lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Must contain at least one uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, { message: 'Must contain at least one special character' })
  newPassword: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsString()
  @Validate(PasswordMatchConstraint, ['newPassword'])
  confirmPassword: string;
}
