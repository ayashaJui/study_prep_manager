"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const note_schema_1 = require("../common/schemas/note.schema");
const topic_schema_1 = require("../common/schemas/topic.schema");
let NotesService = class NotesService {
    constructor(noteModel, topicModel) {
        this.noteModel = noteModel;
        this.topicModel = topicModel;
    }
    async getAll(userId, topicId) {
        if (!topicId)
            throw new common_1.BadRequestException('topicId is required');
        return this.noteModel.find({ userId, topicId }).sort({ pinned: -1, createdAt: -1 });
    }
    async getPinned(userId) {
        return this.noteModel
            .find({ userId, pinned: true })
            .populate('topicId', 'name slug parentId path level')
            .sort({ createdAt: -1 });
    }
    async getById(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid note ID');
        const note = await this.noteModel.findOne({ _id: id, userId });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return note;
    }
    async create(userId, data) {
        if (!data.topicId || !data.content?.trim())
            throw new common_1.BadRequestException('topicId and content are required');
        const topic = await this.topicModel.findOne({ _id: data.topicId, userId });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const note = await this.noteModel.create({ ...data, userId });
        await this.topicModel.findByIdAndUpdate(data.topicId, { $inc: { 'stats.notesCount': 1 } });
        return note;
    }
    async update(id, userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid note ID');
        const note = await this.noteModel.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return note;
    }
    async delete(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid note ID');
        const note = await this.noteModel.findOneAndDelete({ _id: id, userId });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        await this.topicModel.findByIdAndUpdate(note.topicId, { $inc: { 'stats.notesCount': -1 } });
        return null;
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(note_schema_1.NOTE_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], NotesService);
//# sourceMappingURL=notes.service.js.map