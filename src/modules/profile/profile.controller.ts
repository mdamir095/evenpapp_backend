import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileAccessGuard } from '@common/guards/profile-access.guard';
import { UserService } from '@modules/user/user.service';
import { UpdateProfileDto } from '@modules/auth/dto/request/update-profile.req.dto';
import { UpdateProfileImageDto } from '@modules/auth/dto/request/update-profile-image.dto';
import { ChangePasswordDto } from '@modules/admin/dto/request/change-password.dto';

/**
 * Profile Controller
 * 
 * This controller handles profile-related operations that should be accessible
 * to ALL authenticated users regardless of their role or permissions.
 * 
 * Features:
 * - Get user profile
 * - Update profile information  
 * - Change password
 * - Upload/update profile image
 * 
 * Access: Universal (all user types)
 */
@ApiTags('Profile')
@Controller('profile')
@ApiBearerAuth()
@UseGuards(ProfileAccessGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieves profile information for the currently authenticated user. Accessible to all user types.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required' 
  })
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    return this.userService.findOneWithRoles(userId);
  }

  @Put()
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Updates profile information for the currently authenticated user. Accessible to all user types.'
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required' 
  })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.userService.updateUser(userId, dto);
  }

  @Put('image')
  @ApiOperation({ 
    summary: 'Update profile image',
    description: 'Updates profile image using base64 encoded image data. Accessible to all user types.'
  })
  @ApiBody({ type: UpdateProfileImageDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile image updated successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid image data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required' 
  })
  async updateProfileImage(
    @Req() req: any,
    @Body() dto: UpdateProfileImageDto,
  ) {
    const userId = req.user.id;
    return this.userService.updateProfileImageBase64(userId, dto.profileImage);
  }

  @Post('upload')
  @ApiOperation({ 
    summary: 'Upload profile image file',
    description: 'Uploads a profile image file (PNG, JPEG, JPG). Accessible to all user types.'
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'File uploaded successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file format or no file provided' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required' 
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    try {
      console.log('Profile upload endpoint called');
      console.log('File received:', !!file);
      console.log('Request body keys:', Object.keys(req.body || {}));
      console.log('Request files:', req.files);
      
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      
      if (!file) {
        console.log('No file uploaded - throwing error');
        throw new BadRequestException('No file uploaded');
      }

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: PNG, JPEG, JPG`);
      }
      
      console.log('Starting file upload process...');
      
      // Upload the file and get the image URL
      const imageUrl = await this.userService.uploadFilesToS3Bucket(file);
      console.log('File uploaded successfully, URL:', imageUrl);
      
      if (!imageUrl) {
        throw new BadRequestException('File upload failed - no URL returned');
      }
      
      // Update the user's profile image in the database
      const userId = req.user.id;
      console.log('Updating user profile with image URL for user:', userId);
      await this.userService.updateUser(userId, { profileImage: imageUrl });
      
      // Return the complete user profile data
      const updatedProfile = await this.userService.findOneWithRoles(userId);
      console.log('Profile updated successfully');
      return updatedProfile;
      
    } catch (error) {
      console.error('Profile upload error:', error);
      throw error;
    }
  }

  @Put('change-password')
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Changes password for the currently authenticated user. Accessible to all user types.'
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid password data or current password incorrect' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required' 
  })
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    const userId = req.user.id;
    return this.userService.changePassword(userId, dto);
  }
}
