import {Controller, UseGuards, Post, Get, Param, Delete, Patch, Body} from "@nestjs/common";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";
import { IdeaAIService } from "./ideaAI.service";
import { IdeaAIIdParamDto, IdeaAIUpdateDto } from "./dto/ideaAI.dto";

@UseGuards()
@Controller('ideaAI')
export class IdeaAIController {
  constructor(private readonly ideaAIService: IdeaAIService) {}

  @Post("/:id")
  @ResponseMessage('Ideas have been created!')
  async fetchIdeasAI(@Param() { id }: IdeaAIIdParamDto) {
    console.log("FETCH IDEA CONTROLLER")
    return this.ideaAIService.fetchIdeas(id)
  }

  @Get("/:id")
  @ResponseMessage('Ideas have been gotten!')
  async getIdeasAI(@Param() { id }: IdeaAIIdParamDto) {
    return this.ideaAIService.getIdeas(id)
  }

  @Patch("/:id")
  @ResponseMessage('Idea has been updated!')
  updateProfile(@Param() { id }: IdeaAIIdParamDto, @Body() body: IdeaAIUpdateDto) {
    return this.ideaAIService.updateIdea(id, body);
  }

  @Delete("/:id")
  @ResponseMessage("Idea has been deleted!")
  async deleteIdea(@Param() { id }: IdeaAIIdParamDto) {
    return await this.ideaAIService.deleteIdea(id);
  }
}