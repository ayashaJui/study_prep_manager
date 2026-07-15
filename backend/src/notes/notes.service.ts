import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { INoteDocument, NOTE_MODEL } from '../common/schemas/note.schema';
import { ITopicDocument, TOPIC_MODEL } from '../common/schemas/topic.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(NOTE_MODEL) private noteModel: Model<INoteDocument>,
    @InjectModel(TOPIC_MODEL) private topicModel: Model<ITopicDocument>,
  ) {}

  async getAll(userId: string, topicId: string) {
    if (!topicId) throw new BadRequestException('topicId is required');
    return this.noteModel.find({ userId, topicId }).sort({ pinned: -1, createdAt: -1 });
  }

  async getPinned(userId: string) {
    return this.noteModel
      .find({ userId, pinned: true })
      .populate('topicId', 'name slug parentId path level')
      .sort({ createdAt: -1 });
  }

  async getById(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid note ID');
    const note = await this.noteModel.findOne({ _id: id, userId });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async create(userId: string, data: { topicId: string; content: string; tags?: string[]; pinned?: boolean }) {
    if (!data.topicId || !data.content?.trim()) throw new BadRequestException('topicId and content are required');

    const topic = await this.topicModel.findOne({ _id: data.topicId, userId });
    if (!topic) throw new NotFoundException('Topic not found');

    const note = await this.noteModel.create({ ...data, userId } as any);
    await this.topicModel.findByIdAndUpdate(data.topicId, { $inc: { 'stats.notesCount': 1 } });
    return note;
  }

  async update(id: string, userId: string, data: Partial<{ content: string; tags: string[]; pinned: boolean }>) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid note ID');
    const note = await this.noteModel.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async delete(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid note ID');
    const note = await this.noteModel.findOneAndDelete({ _id: id, userId });
    if (!note) throw new NotFoundException('Note not found');
    await this.topicModel.findByIdAndUpdate(note.topicId, { $inc: { 'stats.notesCount': -1 } });
    return null;
  }
}
