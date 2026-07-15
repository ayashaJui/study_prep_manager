import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { FlashcardSchema, FLASHCARD_MODEL } from '../common/schemas/flashcard.schema';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: FLASHCARD_MODEL, schema: FlashcardSchema },
    { name: TOPIC_MODEL, schema: TopicSchema },
  ])],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
})
export class FlashcardsModule {}
