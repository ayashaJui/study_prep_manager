import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { NoteSchema, NOTE_MODEL } from '../common/schemas/note.schema';
import { FlashcardSchema, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { QuizSchema, QUIZ_MODEL } from '../common/schemas/quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TOPIC_MODEL, schema: TopicSchema },
      { name: NOTE_MODEL, schema: NoteSchema },
      { name: FLASHCARD_MODEL, schema: FlashcardSchema },
      { name: QUIZ_MODEL, schema: QuizSchema },
    ]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
})
export class TopicsModule {}
