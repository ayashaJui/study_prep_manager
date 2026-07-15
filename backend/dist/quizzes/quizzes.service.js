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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
const topic_schema_1 = require("../common/schemas/topic.schema");
const study_session_schema_1 = require("../common/schemas/study-session.schema");
let QuizzesService = class QuizzesService {
    constructor(quizModel, topicModel, sessionModel) {
        this.quizModel = quizModel;
        this.topicModel = topicModel;
        this.sessionModel = sessionModel;
    }
    async getAll(userId, topicId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(topicId))
            throw new common_1.BadRequestException('Invalid topic ID');
        return this.quizModel.find({ topicId, userId }).sort({ createdAt: -1 });
    }
    async getById(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid quiz ID');
        const quiz = await this.quizModel.findOne({ _id: id, userId });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async create(userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(data.topicId))
            throw new common_1.BadRequestException('Invalid topic ID');
        const topic = await this.topicModel.findOne({ _id: data.topicId, userId });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const quiz = await this.quizModel.create({ ...data, userId });
        await this.topicModel.findByIdAndUpdate(data.topicId, { $inc: { 'stats.quizzesCount': 1 } });
        return quiz;
    }
    async update(id, userId, data) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid quiz ID');
        const quiz = await this.quizModel.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async delete(id, userId) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid quiz ID');
        const quiz = await this.quizModel.findOneAndDelete({ _id: id, userId });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        await this.topicModel.findByIdAndUpdate(quiz.topicId, { $inc: { 'stats.quizzesCount': -1 } });
        return null;
    }
    async submit(id, userId, answers, timeTaken) {
        if (!mongoose_3.default.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid quiz ID');
        const quiz = await this.quizModel.findOne({ _id: id, userId });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        let score = 0;
        let totalPoints = 0;
        for (const q of quiz.questions) {
            totalPoints += q.points || 1;
            const submitted = answers.find((a) => a.questionId === q.id);
            if (!submitted || submitted.selectedAnswer === null)
                continue;
            const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
            const selected = Array.isArray(submitted.selectedAnswer) ? submitted.selectedAnswer : [submitted.selectedAnswer];
            const sorted = (arr) => [...arr].sort((a, b) => a - b);
            if (JSON.stringify(sorted(selected)) === JSON.stringify(sorted(correct))) {
                score += q.points || 1;
            }
        }
        await this.quizModel.findOneAndUpdate({ _id: id, userId }, { $push: { attempts: { attemptId: new mongoose_3.default.Types.ObjectId(), date: new Date(), score, totalPoints, timeTaken, answers: [] } } });
        const scorePct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        await this.sessionModel.create({ userId, topicId: quiz.topicId, activityType: 'quiz', duration: Math.ceil(timeTaken / 60), score: scorePct });
        return { score, totalPoints };
    }
    async getAnalytics(userId, topicId) {
        const quizzes = await this.quizModel.find({ userId, topicId }).lean();
        const summary = { totalQuizzes: quizzes.length, quizzesAttempted: 0, totalAttempts: 0, avgScore: 0, bestScore: 0 };
        const analyticsQuizzes = [];
        let totalScorePct = 0;
        for (const quiz of quizzes) {
            const attempts = (quiz.attempts || []).map((a) => ({
                date: a.date,
                scorePct: a.totalPoints > 0 ? Math.round((a.score / a.totalPoints) * 100) : 0,
                timeTaken: a.timeTaken,
            }));
            if (attempts.length > 0) {
                summary.quizzesAttempted++;
                summary.totalAttempts += attempts.length;
                const avg = attempts.reduce((s, a) => s + a.scorePct, 0) / attempts.length;
                totalScorePct += avg;
                summary.bestScore = Math.max(summary.bestScore, ...attempts.map((a) => a.scorePct));
            }
            analyticsQuizzes.push({ quizId: quiz._id, title: quiz.title, difficulty: quiz.difficulty, attempts });
        }
        if (summary.quizzesAttempted > 0)
            summary.avgScore = Math.round(totalScorePct / summary.quizzesAttempted);
        return { summary, quizzes: analyticsQuizzes };
    }
    async importBulk(userId, topicId, quizzes) {
        if (!mongoose_3.default.Types.ObjectId.isValid(topicId))
            throw new common_1.BadRequestException('Invalid topic ID');
        const topic = await this.topicModel.findOne({ _id: topicId, userId });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const docs = quizzes.map((q) => ({ ...q, topicId, userId, attempts: [] }));
        const created = await this.quizModel.insertMany(docs);
        await this.topicModel.findByIdAndUpdate(topicId, { $inc: { 'stats.quizzesCount': created.length } });
        return created;
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(quiz_schema_1.QUIZ_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __param(2, (0, mongoose_1.InjectModel)(study_session_schema_1.STUDY_SESSION_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map