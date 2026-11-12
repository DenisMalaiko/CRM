import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { DesignSystemService } from './designSystem.service';
import {
  DesignSystemIdParamDto,
  BusinessIdParamDto,
  CreateDesignSystemDto,
  CreateDesignSystemFromPhotoDto,
  UpdateDesignSystemDto,
} from './dto/designSystem.dto';

@UseGuards(JwtAuthGuard)
@Controller('design-systems')
export class DesignSystemController {
  constructor(private readonly designSystemService: DesignSystemService) {}

  @Get('/presets')
  @ResponseMessage('Design system presets retrieved')
  async getPresets() {
    return this.designSystemService.getPresets();
  }

  @Get('/business/:businessId')
  @ResponseMessage('Business design systems retrieved')
  async getByBusinessId(
    @Param() { businessId }: BusinessIdParamDto,
    @Request() req,
  ) {
    return this.designSystemService.getByBusinessId(
      businessId,
      req.user.agencyId,
    );
  }

  @Get('/:id')
  @ResponseMessage('Design system retrieved')
  async getById(@Param() { id }: DesignSystemIdParamDto, @Request() req) {
    return this.designSystemService.getById(id, req.user.agencyId);
  }

  @Post('/from-photo')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ResponseMessage('Design system created from photo')
  async createFromPhoto(
    @Body() dto: CreateDesignSystemFromPhotoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.designSystemService.createFromPhoto(
      file,
      dto.businessId,
      req.user.agencyId,
      dto.name,
    );
  }

  @Post('/')
  @ResponseMessage('Design system created')
  async create(@Body() dto: CreateDesignSystemDto, @Request() req) {
    return this.designSystemService.create(dto, req.user.agencyId);
  }

  @Post('/duplicate/:id')
  @ResponseMessage('Design system duplicated')
  async duplicate(
    @Param() { id }: DesignSystemIdParamDto,
    @Body() { businessId }: BusinessIdParamDto,
    @Request() req,
  ) {
    return this.designSystemService.duplicate(
      id,
      businessId,
      req.user.agencyId,
    );
  }

  @Patch('/:id')
  @ResponseMessage('Design system updated')
  async update(
    @Param() { id }: DesignSystemIdParamDto,
    @Body() dto: UpdateDesignSystemDto,
    @Request() req,
  ) {
    return this.designSystemService.update(id, req.user.agencyId, dto);
  }

  @Delete('/:id')
  @ResponseMessage('Design system deleted')
  async remove(@Param() { id }: DesignSystemIdParamDto, @Request() req) {
    return this.designSystemService.remove(id, req.user.agencyId);
  }
}
