import { Injectable, BadRequestException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { ProjectsRepository } from '../projects/projects.repository';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async createTask(title: string, projectId: string): Promise<Task> {
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new BadRequestException('Project does not exist');
    }

    return this.tasksRepository.create(title, projectId);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.tasksRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    return task;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.tasksRepository.findByProject(projectId);
  }

  async updateTaskStatus(id: string, completed: boolean): Promise<Task> {
    return this.tasksRepository.updateStatus(id, completed);
  }

  async deleteTask(id: string): Promise<Task> {
    return this.tasksRepository.delete(id);
  }
}
