import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { UserSchema, USER_MODEL } from '../common/schemas/user.schema';
import { NoteSchema, NOTE_MODEL } from '../common/schemas/note.schema';
import { FlashcardSchema, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { QuizSchema, QUIZ_MODEL } from '../common/schemas/quiz.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: TOPIC_MODEL, schema: TopicSchema },
    { name: USER_MODEL, schema: UserSchema },
    { name: NOTE_MODEL, schema: NoteSchema },
    { name: FLASHCARD_MODEL, schema: FlashcardSchema },
    { name: QUIZ_MODEL, schema: QuizSchema },
  ])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
