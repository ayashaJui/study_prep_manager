import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudySessionsController } from './study-sessions.controller';
import { StudySessionsService } from './study-sessions.service';
import { StudySessionSchema, STUDY_SESSION_MODEL } from '../common/schemas/study-session.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: STUDY_SESSION_MODEL, schema: StudySessionSchema }])],
  controllers: [StudySessionsController],
  providers: [StudySessionsService],
})
export class StudySessionsModule {}
