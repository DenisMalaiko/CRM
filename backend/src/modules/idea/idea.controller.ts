import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Get,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { IdeaService } from './idea.service';
import {
  IdeaIdParamDto,
  IdeaParamsDto,
  IdeaUpdateDto,
  IdeaFilterDto,
} from './dto/idea.dto';

@UseGuards(JwtAuthGuard)
@Controller('ideas')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Get('/list/:id')
  @ResponseMessage('Ideas has been got!')
  async getIdeas(
    @Param() { id }: IdeaIdParamDto,
    @Query() query: IdeaFilterDto,
  ) {
    const data = await this.ideaService.getIdeas(id, query.sourceType);
    console.log("DATA ", data);
    return data;
  }

  @Post('/:id')
  @ResponseMessage('Ideas has been created!')
  async fetchIdeas(
    @Param() { id }: IdeaIdParamDto,
    @Body() body: IdeaParamsDto,
  ) {
    return await this.ideaService.fetchIdeas(id, body);
  }

  @Patch('/:id')
  @ResponseMessage('Idea has been updated!')
  updateProfile(@Param() { id }: IdeaIdParamDto, @Body() body: IdeaUpdateDto) {
    return this.ideaService.updateIdea(id, body);
  }

  @Delete('/:id')
  @ResponseMessage('Idea has been deleted!')
  async deleteIdea(@Param() { id }: IdeaIdParamDto) {
    return await this.ideaService.deleteIdea(id);
  }
}
