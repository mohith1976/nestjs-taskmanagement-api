import { Injectable, BadRequestException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { UsersRepository } from '../users/users.repository';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createProject(name: string, userId: string): Promise<Project> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    return this.projectsRepository.create(name, userId);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }

  async getProjectById(id: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    return project;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.projectsRepository.findByUser(userId);
  }

  async deleteProject(id: string): Promise<Project> {
    return this.projectsRepository.delete(id);
  }
}
