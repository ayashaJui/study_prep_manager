import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { QuizSchema, QUIZ_MODEL } from '../common/schemas/quiz.schema';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { StudySessionSchema, STUDY_SESSION_MODEL } from '../common/schemas/study-session.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: QUIZ_MODEL, schema: QuizSchema },
    { name: TOPIC_MODEL, schema: TopicSchema },
    { name: STUDY_SESSION_MODEL, schema: StudySessionSchema },
  ])],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
