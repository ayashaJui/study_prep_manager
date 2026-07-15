import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NoteSchema, NOTE_MODEL } from '../common/schemas/note.schema';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: NOTE_MODEL, schema: NoteSchema },
    { name: TOPIC_MODEL, schema: TopicSchema },
  ])],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
