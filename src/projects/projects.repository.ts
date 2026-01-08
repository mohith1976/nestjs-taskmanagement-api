import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, userId: string): Promise<Project> {
    return this.prisma.project.create({
      data: {
        name,
        userId,
      },
    });
  }

  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      include: {
        user: true,
      },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUser(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
    });
  }

  async delete(id: string): Promise<Project> {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
