import {Body, Controller, Param, Post, Get, UseGuards} from "@nestjs/common";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";
import { IdeaService } from "./idea.service";
import { IdeaIdParamDto, IdeaParamsDto } from "./dto/idea.dto";


@UseGuards(JwtAuthGuard)
@Controller("ideas")
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Get("/list/:id")
  @ResponseMessage("Ideas has been got!")
  async getIdeas(@Param() { id }: IdeaIdParamDto) {
    return await this.ideaService.getIdeas(id);
  }

  @Post("/:id")
  @ResponseMessage("Ideas has been created!")
  async fetchIdeas(@Param() { id }: IdeaIdParamDto, @Body() body: IdeaParamsDto) {
    return await this.ideaService.fetchIdeas(id, body);
  }
}