import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { NoteSchema, NOTE_MODEL } from '../common/schemas/note.schema';
import { FlashcardSchema, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { QuizSchema, QUIZ_MODEL } from '../common/schemas/quiz.schema';
import { StudySessionSchema, STUDY_SESSION_MODEL } from '../common/schemas/study-session.schema';
import { UserSchema, USER_MODEL } from '../common/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: TOPIC_MODEL, schema: TopicSchema },
    { name: NOTE_MODEL, schema: NoteSchema },
    { name: FLASHCARD_MODEL, schema: FlashcardSchema },
    { name: QUIZ_MODEL, schema: QuizSchema },
    { name: STUDY_SESSION_MODEL, schema: StudySessionSchema },
    { name: USER_MODEL, schema: UserSchema },
  ])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
