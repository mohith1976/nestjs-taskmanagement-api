import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Body('name') name: string,
    @Body('userId') userId: string,
  ) {
    return this.projectsService.createProject(name, userId);
  }

  @Get()
  async getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Get('/user/:userId')
  async getProjectsByUser(@Param('userId') userId: string) {
    return this.projectsService.getProjectsByUser(userId);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
