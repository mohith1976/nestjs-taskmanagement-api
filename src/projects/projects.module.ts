import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { UsersRepository } from '../users/users.repository';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository, UsersRepository],
})
export class ProjectsModule {}
