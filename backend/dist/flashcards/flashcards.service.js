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
exports.FlashcardsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const flashcard_schema_1 = require("../common/schemas/flashcard.schema");
const topic_schema_1 = require("../common/schemas/topic.schema");
let FlashcardsService = class FlashcardsService {
    constructor(flashcardModel, topicModel) {
        this.flashcardModel = flashcardModel;
        this.topicModel = topicModel;
    }
    async getAll(userId, topicId) {
        if (topicId) {
            if (!mongoose_3.default.Types.ObjectId.isValid(topicId))
                throw new common_1.BadRequestException('Invalid topic ID');
            return this.flashcardModel.find({ userId, topicId }).sort({ createdAt: -1 });
        }
        return this.flashcardModel
            .find({ userId })
            .populate('topicId', 'name')
            .sort({ nextReview: 1, createdAt: -1 });
    }
    async getById(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid flashcard ID');
        const card = await this.flashcardModel.findOne({ _id: id, userId });
        if (!card)
            throw new common_1.NotFoundException('Flashcard not found');
        return card;
    }
    async create(userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(data.topicId))
            throw new common_1.BadRequestException('Invalid topic ID');
        const topic = await this.topicModel.findOne({ _id: data.topicId, userId });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const card = await this.flashcardModel.create({ ...data, userId });
        await this.topicModel.findByIdAndUpdate(data.topicId, { $inc: { 'stats.flashcardsCount': 1 } });
        return card;
    }
    async update(id, userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid flashcard ID');
        const card = await this.flashcardModel.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });
        if (!card)
            throw new common_1.NotFoundException('Flashcard not found');
        return card;
    }
    async delete(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid flashcard ID');
        const card = await this.flashcardModel.findOneAndDelete({ _id: id, userId });
        if (!card)
            throw new common_1.NotFoundException('Flashcard not found');
        await this.topicModel.findByIdAndUpdate(card.topicId, { $inc: { 'stats.flashcardsCount': -1 } });
        return null;
    }
    async review(id, userId, quality) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid flashcard ID');
        if (!Number.isInteger(quality) || quality < 0 || quality > 5)
            throw new common_1.BadRequestException('Quality must be 0-5');
        const card = await this.flashcardModel.findOne({ _id: id, userId });
        if (!card)
            throw new common_1.NotFoundException('Flashcard not found');
        const currentEase = card.easeFactor || 2.5;
        const currentInterval = card.intervalDays || 0;
        const currentReps = card.reviewCount || 0;
        let newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newEase = Math.min(3.5, Math.max(1.3, newEase));
        let newReps = currentReps;
        let newInterval = currentInterval;
        if (quality < 3) {
            newReps = 0;
            newInterval = 1;
        }
        else {
            newReps = currentReps + 1;
            if (newReps === 1)
                newInterval = 1;
            else if (newReps === 2)
                newInterval = 6;
            else
                newInterval = Math.round(currentInterval * newEase);
        }
        const confidence = quality >= 4 ? 'easy' : quality === 3 ? 'medium' : 'hard';
        const status = quality < 3 ? 'learning' : newReps >= 5 ? 'mastered' : 'review';
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + Math.max(1, newInterval));
        card.easeFactor = newEase;
        card.intervalDays = newInterval;
        card.reviewCount = newReps;
        card.lastReviewed = new Date();
        card.nextReview = nextReview;
        card.confidence = confidence;
        card.status = status;
        await card.save();
        return card;
    }
    async importBulk(userId, topicId, flashcards) {
        if (!mongoose_3.default.Types.ObjectId.isValid(topicId))
            throw new common_1.BadRequestException('Invalid topic ID');
        const topic = await this.topicModel.findOne({ _id: topicId, userId });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const batchId = new mongoose_3.default.Types.ObjectId().toString();
        const docs = flashcards.map((f) => ({
            ...f,
            topicId,
            userId,
            importSource: { type: 'manual', importedAt: new Date(), batchId },
        }));
        const created = await this.flashcardModel.insertMany(docs);
        await this.topicModel.findByIdAndUpdate(topicId, { $inc: { 'stats.flashcardsCount': created.length } });
        return created;
    }
};
exports.FlashcardsService = FlashcardsService;
exports.FlashcardsService = FlashcardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(flashcard_schema_1.FLASHCARD_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], FlashcardsService);
//# sourceMappingURL=flashcards.service.js.map