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
exports.TopicsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const crypto = require("crypto");
const topic_schema_1 = require("../common/schemas/topic.schema");
const note_schema_1 = require("../common/schemas/note.schema");
const flashcard_schema_1 = require("../common/schemas/flashcard.schema");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
let TopicsService = class TopicsService {
    constructor(topicModel, noteModel, flashcardModel, quizModel) {
        this.topicModel = topicModel;
        this.noteModel = noteModel;
        this.flashcardModel = flashcardModel;
        this.quizModel = quizModel;
    }
    async getAll(userId, parentId, favorite) {
        const query = {};
        if (mongoose_3.default.Types.ObjectId.isValid(userId))
            query.userId = new mongoose_3.default.Types.ObjectId(userId);
        if (parentId) {
            if (parentId === 'null' || parentId === 'root') {
                query.parentId = null;
            }
            else if (mongoose_3.default.Types.ObjectId.isValid(parentId)) {
                query.parentId = parentId;
            }
            else {
                const parent = await this.topicModel.findOne({ slug: parentId, userId: query.userId }).select('_id').lean();
                if (!parent)
                    return [];
                query.parentId = parent._id.toString();
            }
        }
        if (favorite === true)
            query.favorite = true;
        return this.topicModel.find(query).sort({ createdAt: -1 });
    }
    async getById(id, userId) {
        const userObjId = new mongoose_3.default.Types.ObjectId(userId);
        let topic;
        if (mongoose_3.default.Types.ObjectId.isValid(id)) {
            topic = await this.topicModel.findOne({ _id: id, userId: userObjId });
        }
        else {
            topic = await this.topicModel.findOne({ slug: id, userId: userObjId });
        }
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        return topic;
    }
    async getBySlug(slug, userId, parentId) {
        if (!slug?.trim())
            throw new common_1.BadRequestException('Slug is required');
        const query = { slug: slug.trim().toLowerCase(), userId: new mongoose_3.default.Types.ObjectId(userId) };
        if (parentId) {
            query.parentId = (parentId === 'null' || parentId === 'root') ? null : parentId;
        }
        const topic = await this.topicModel.findOne(query);
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        return topic;
    }
    async create(data) {
        if (!data.name?.trim())
            throw new common_1.BadRequestException('Topic name is required');
        if (data.parentId) {
            if (!mongoose_3.default.Types.ObjectId.isValid(data.parentId))
                throw new common_1.BadRequestException('Invalid parent topic ID');
            const parent = await this.topicModel.findOne({ _id: data.parentId, userId: data.userId });
            if (!parent)
                throw new common_1.NotFoundException('Parent topic not found');
        }
        const topic = new this.topicModel({
            name: data.name.trim(),
            description: data.description?.trim(),
            parentId: data.parentId || null,
            level: data.level ?? 0,
            path: data.path || [],
            status: data.status || 'not-started',
            tags: data.tags || [],
            favorite: data.favorite ?? false,
            userId: data.userId,
            stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 0 },
        });
        for (let attempt = 1;; attempt++) {
            try {
                await topic.save();
                break;
            }
            catch (err) {
                if (err.code === 11000 && err.keyPattern?.slug && attempt < 5) {
                    topic.slug = undefined;
                    topic.markModified('slug');
                }
                else
                    throw err;
            }
        }
        return topic;
    }
    async update(id, userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid topic ID');
        const topic = await this.topicModel.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true, runValidators: true });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        if (data.status && topic.parentId) {
            const siblings = await this.topicModel.find({ parentId: topic.parentId, userId }).select('status').lean();
            const mastered = siblings.filter((s) => s.status === 'mastered').length;
            const pct = siblings.length > 0 ? Math.round((mastered / siblings.length) * 100) : 0;
            await this.topicModel.findByIdAndUpdate(topic.parentId, { 'stats.completionPercentage': pct });
        }
        return topic;
    }
    async delete(id, userId, recursive) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid topic ID');
        if (recursive) {
            const topicObjId = new mongoose_3.default.Types.ObjectId(id);
            const userObjId = new mongoose_3.default.Types.ObjectId(userId);
            const topic = await this.topicModel.findOne({ _id: topicObjId, userId: userObjId });
            if (!topic)
                throw new common_1.NotFoundException('Topic not found');
            const descendants = await this.topicModel.find({ path: topicObjId, userId: userObjId }).select('_id').lean();
            const allIds = [topicObjId, ...descendants.map((d) => d._id)];
            await this.noteModel.deleteMany({ topicId: { $in: allIds } });
            await this.flashcardModel.deleteMany({ topicId: { $in: allIds } });
            await this.quizModel.deleteMany({ topicId: { $in: allIds } });
            await this.topicModel.deleteMany({ path: topicObjId, userId: userObjId });
            await this.topicModel.findOneAndDelete({ _id: topicObjId, userId: userObjId });
            return topic;
        }
        const hasChildren = await this.topicModel.findOne({ parentId: id, userId });
        if (hasChildren)
            throw new common_1.ConflictException('Cannot delete topic with subtopics. Delete subtopics first or use recursive delete.');
        const topic = await this.topicModel.findOneAndDelete({ _id: id, userId });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        return topic;
    }
    async publish(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid topic ID');
        const shareId = crypto.randomBytes(8).toString('hex');
        const topic = await this.topicModel.findOneAndUpdate({ _id: id, userId }, { $set: { isPublic: true, shareId } }, { new: true });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return { shareId: topic.shareId, publicUrl: `${appUrl}/public/${topic.shareId}` };
    }
    async unpublish(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid topic ID');
        const topic = await this.topicModel.findOneAndUpdate({ _id: id, userId }, { $set: { isPublic: false, shareId: null } }, { new: true });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        return null;
    }
};
exports.TopicsService = TopicsService;
exports.TopicsService = TopicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(note_schema_1.NOTE_MODEL)),
    __param(2, (0, mongoose_1.InjectModel)(flashcard_schema_1.FLASHCARD_MODEL)),
    __param(3, (0, mongoose_1.InjectModel)(quiz_schema_1.QUIZ_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TopicsService);
//# sourceMappingURL=topics.service.js.map