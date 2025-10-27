import { BadRequestException, Body, Controller, Get, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateProfileDto } from "@modules/auth/dto/request/update-profile.req.dto";
import { UpdateProfileImageDto } from "@modules/auth/dto/request/update-profile-image.dto";
import { ChangePasswordDto } from "@modules/admin/dto/request/change-password.dto";
import { FormPaginatedResponseDto } from "@modules/form/dto/response/form-paginated.dto";
import { FormService } from "@modules/form/form.service";
import { UpdateFcmTokenDto } from "./dto/request/update-fcm-token.dto";
import { UpdateFcmTokenResponseDto } from "./dto/response/update-fcm-token-response.dto";
import { plainToInstance } from "class-transformer";
import { HttpStatus } from "@nestjs/common";

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    
    constructor(private readonly userService: UserService,private readonly formService: FormService) {    
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @Get()
    @UseGuards(AuthGuard('jwt'))
    getUser(@Req() req: any) {
    const userId = req.user.id;
     return this.userService.findById(userId);
    }

    @Patch('update-profile')
    @UseGuards(AuthGuard('jwt'))
    async updateProfile(@Req() req: any , @Body() dto: UpdateProfileDto) {
      const userId = req.user.id;
      return this.userService.updateUser(userId, dto);
    }

    @Put('update-profile-image')
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({ type: UpdateProfileImageDto })
    async updateProfileImage(
        @Req() req:any,
        @Body() dto: UpdateProfileImageDto,
    ) {
        return this.userService.updateProfileImageBase64(req.user.id, dto.profileImage);
    }

    @Post('upload')
    @UseGuards(AuthGuard('jwt'))
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
    async upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
         const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
        }
        
        // Upload the file and get the image URL
        const imageUrl = await this.userService.uploadFilesToS3Bucket(file);
        
        // Update the user's profile image in the database
        const userId = req.user.id;
        await this.userService.updateUser(userId, { profileImage: imageUrl });
        
        // Return the complete user profile data
        return await this.userService.findOneWithRoles(userId);
    }

    @Put('change-password')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Change password' })
    @ApiBody({ type: ChangePasswordDto })
    async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    const userId = req.user.id;
    return this.userService.changePassword(userId, dto);
    }

    @ApiOperation({ summary: 'Get all forms with pagination and optional type filter' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default 1)' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Page size (default 10)' })
    @ApiQuery({ name: 'type', type: String, required: false, description: 'Filter forms by type (e.g., venue-category, event, etc.)' })
    @Get()
    async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    ): Promise<FormPaginatedResponseDto> {
    return this.formService.findAll(page, limit, type);
    }

    @Post('update-fcm-token')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Update user FCM token',
        description: 'Updates the Firebase Cloud Messaging token for push notifications'
    })
    @ApiBody({ type: UpdateFcmTokenDto })
    async updateFcmToken(
        @Req() req: any,
        @Body() dto: UpdateFcmTokenDto
    ): Promise<UpdateFcmTokenResponseDto> {
        const userId = req.user.id;
        const updatedUser = await this.userService.updateFcmToken(userId, dto.fcmToken);
        
        return plainToInstance(UpdateFcmTokenResponseDto, {
            id: updatedUser.id || (updatedUser as any)._id,
            email: updatedUser.email,
            fcmToken: updatedUser.fcmToken,
            updatedAt: updatedUser.updatedAt,
            message: 'FCM token updated successfully'
        }, { excludeExtraneousValues: true });
    }
}