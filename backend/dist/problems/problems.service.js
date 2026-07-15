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
exports.ProblemsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const problem_schema_1 = require("../common/schemas/problem.schema");
const REVIEW_INTERVALS = { easy: 7, medium: 3, hard: 1, again: 0 };
let ProblemsService = class ProblemsService {
    constructor(problemModel) {
        this.problemModel = problemModel;
    }
    async getAll(userId, filters) {
        const query = { userId: new mongoose_3.default.Types.ObjectId(userId) };
        if (filters.topicId && mongoose_3.default.Types.ObjectId.isValid(filters.topicId))
            query.topicId = new mongoose_3.default.Types.ObjectId(filters.topicId);
        if (filters.status)
            query.status = filters.status;
        if (filters.difficulty)
            query.difficulty = filters.difficulty;
        if (filters.platform)
            query.platform = { $regex: filters.platform, $options: 'i' };
        if (filters.tag)
            query.tags = filters.tag;
        if (filters.due) {
            query.status = { $in: ['solved', 'attempted'] };
            query.nextReview = { $lte: new Date() };
        }
        return this.problemModel.find(query).sort({ createdAt: -1 });
    }
    async getById(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid problem ID');
        const problem = await this.problemModel.findOne({ _id: id, userId });
        if (!problem)
            throw new common_1.NotFoundException('Problem not found');
        return problem;
    }
    async create(userId, data) {
        const problem = new this.problemModel({
            ...data,
            userId: new mongoose_3.default.Types.ObjectId(userId),
            topicId: data.topicId && mongoose_3.default.Types.ObjectId.isValid(data.topicId) ? new mongoose_3.default.Types.ObjectId(data.topicId) : null,
            reviewCount: 0,
        });
        await problem.save();
        return problem;
    }
    async update(id, userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid problem ID');
        if (data.topicId === '' || data.topicId === null)
            data.topicId = null;
        const problem = await this.problemModel.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true, runValidators: true });
        if (!problem)
            throw new common_1.NotFoundException('Problem not found');
        return problem;
    }
    async delete(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid problem ID');
        const problem = await this.problemModel.findOneAndDelete({ _id: id, userId });
        if (!problem)
            throw new common_1.NotFoundException('Problem not found');
        return null;
    }
    async review(id, userId, confidence) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid problem ID');
        const intervalDays = REVIEW_INTERVALS[confidence] ?? 3;
        const nextReview = new Date();
        if (intervalDays > 0)
            nextReview.setDate(nextReview.getDate() + intervalDays);
        const problem = await this.problemModel.findOneAndUpdate({ _id: id, userId }, { $set: { nextReview, reviewInterval: intervalDays, lastReviewedAt: new Date() }, $inc: { reviewCount: 1 } }, { new: true });
        if (!problem)
            throw new common_1.NotFoundException('Problem not found');
        return problem;
    }
};
exports.ProblemsService = ProblemsService;
exports.ProblemsService = ProblemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(problem_schema_1.PROBLEM_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProblemsService);
//# sourceMappingURL=problems.service.js.map