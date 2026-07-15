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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const topic_schema_1 = require("../common/schemas/topic.schema");
const user_schema_1 = require("../common/schemas/user.schema");
let PublicService = class PublicService {
    constructor(topicModel, userModel) {
        this.topicModel = topicModel;
        this.userModel = userModel;
    }
    async getPublicTopics(page = 1, limit = 20) {
        const cap = Math.min(50, Math.max(1, limit));
        const skip = (page - 1) * cap;
        const filter = { isPublic: true, shareId: { $exists: true, $ne: null } };
        const [topics, total] = await Promise.all([
            this.topicModel.find(filter).select('name description shareId stats tags createdAt userId').sort({ createdAt: -1 }).skip(skip).limit(cap).lean(),
            this.topicModel.countDocuments(filter),
        ]);
        const userIds = [...new Set(topics.map((t) => t.userId?.toString()).filter(Boolean))];
        const users = await this.userModel.find({ _id: { $in: userIds } }).select('name').lean();
        const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]));
        const data = topics.map((t) => ({
            shareId: t.shareId,
            name: t.name,
            description: t.description || null,
            tags: t.tags || [],
            stats: { notesCount: t.stats?.notesCount || 0, flashcardsCount: t.stats?.flashcardsCount || 0, quizzesCount: t.stats?.quizzesCount || 0 },
            authorName: t.userId ? (userMap[t.userId.toString()] ?? null) : null,
            createdAt: t.createdAt,
        }));
        return { data, pagination: { page, limit: cap, total, pages: Math.ceil(total / cap) } };
    }
    async getPublicTopicByShareId(shareId) {
        const topic = await this.topicModel.findOne({ shareId, isPublic: true });
        if (!topic)
            throw new common_1.NotFoundException('Public topic not found');
        return topic;
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.USER_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PublicService);
//# sourceMappingURL=public.service.js.map