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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const topic_schema_1 = require("../common/schemas/topic.schema");
const note_schema_1 = require("../common/schemas/note.schema");
const flashcard_schema_1 = require("../common/schemas/flashcard.schema");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
const study_session_schema_1 = require("../common/schemas/study-session.schema");
const user_schema_1 = require("../common/schemas/user.schema");
const METRICS = ['flashcards', 'quizzes', 'topics', 'notes'];
function timeAgo(date) {
    const diffMs = Date.now() - date.getTime();
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(diffMs / 3600000);
    const d = Math.floor(diffMs / 86400000);
    if (m < 1)
        return 'just now';
    if (m < 60)
        return `${m}m ago`;
    if (h < 24)
        return `${h}h ago`;
    if (d < 7)
        return `${d}d ago`;
    if (d < 30)
        return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
}
let DashboardService = class DashboardService {
    constructor(topicModel, noteModel, flashcardModel, quizModel, sessionModel, userModel) {
        this.topicModel = topicModel;
        this.noteModel = noteModel;
        this.flashcardModel = flashcardModel;
        this.quizModel = quizModel;
        this.sessionModel = sessionModel;
        this.userModel = userModel;
    }
    async getStats(userId) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalTopics, totalFlashcards, totalQuizzes, quizzes, recentSessions] = await Promise.all([
            this.topicModel.countDocuments({ userId, level: 0 }),
            this.flashcardModel.countDocuments({ userId }),
            this.quizModel.countDocuments({ userId }),
            this.quizModel.find({ userId }).select('attempts'),
            this.sessionModel.find({ userId, createdAt: { $gte: sevenDaysAgo } }).select('duration'),
        ]);
        const attemptedQuizzes = quizzes.filter((q) => q.lastScore !== null);
        const averageScore = attemptedQuizzes.length > 0
            ? Math.round(attemptedQuizzes.reduce((sum, q) => {
                const last = (q.attempts || []).slice(-1)[0];
                return sum + (last ? Math.round((last.score / (last.totalPoints || 1)) * 100) : 0);
            }, 0) / attemptedQuizzes.length)
            : 0;
        const studyMinutes = recentSessions.reduce((s, sess) => s + (sess.duration || 0), 0);
        const [flashcardsReviewed, quizzesTaken, notesCreated] = await Promise.all([
            this.flashcardModel.countDocuments({ userId, updatedAt: { $gte: sevenDaysAgo } }),
            this.quizModel.countDocuments({ userId, updatedAt: { $gte: sevenDaysAgo } }),
            this.noteModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
        ]);
        return {
            totalTopics,
            totalFlashcards,
            totalQuizzes,
            averageScore,
            weeklyStats: {
                flashcardsReviewed,
                quizzesTaken,
                notesCreated,
                studyTime: Math.round((studyMinutes / 60) * 10) / 10,
            },
        };
    }
    async getActivity(userId, limit = 10) {
        const [notes, flashcards, quizzes] = await Promise.all([
            this.noteModel.find({ userId }).sort({ updatedAt: -1 }).limit(limit).populate('topicId', 'name'),
            this.flashcardModel.find({ userId }).sort({ updatedAt: -1 }).limit(limit).populate('topicId', 'name'),
            this.quizModel.find({ userId }).sort({ updatedAt: -1 }).limit(limit).populate('topicId', 'name'),
        ]);
        return [
            ...notes.map((n) => ({ id: n._id, action: 'Created notes', topic: n.topicId?.name || 'Unknown', time: timeAgo(n.updatedAt), timestamp: n.updatedAt })),
            ...flashcards.map((f) => ({ id: f._id, action: 'Added flashcards', topic: f.topicId?.name || 'Unknown', time: timeAgo(f.updatedAt), timestamp: f.updatedAt })),
            ...quizzes.map((q) => ({ id: q._id, action: q.lastScore ? 'Completed quiz' : 'Created quiz', topic: q.topicId?.name || 'Unknown', time: timeAgo(q.updatedAt), timestamp: q.updatedAt, score: q.lastScore ? `${q.lastScore}` : undefined })),
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit)
            .map(({ timestamp: _ts, ...rest }) => rest);
    }
    async getProgress(userId) {
        const topics = await this.topicModel.find({ userId, level: 0 }).select('name status stats').lean();
        return topics.map((t) => ({
            id: t._id,
            name: t.name,
            status: t.status,
            progress: t.stats?.completionPercentage ?? 0,
        }));
    }
    async getGoals(userId) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [flashcardsThisWeek, quizzesThisWeek, notesThisWeek, topicsReviewed, totalFlashcards, user] = await Promise.all([
            this.flashcardModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
            this.quizModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
            this.noteModel.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
            this.sessionModel.distinct('topicId', { userId, topicId: { $ne: null }, createdAt: { $gte: sevenDaysAgo } }),
            this.flashcardModel.countDocuments({ userId }),
            this.userModel.findById(userId).select('weeklyGoals').lean(),
        ]);
        const defaultFlashcardTarget = Math.max(20, Math.ceil(totalFlashcards / 4));
        const defaults = {
            flashcards: { label: `Complete ${defaultFlashcardTarget} flashcards`, target: defaultFlashcardTarget },
            quizzes: { label: 'Take 3 practice quizzes', target: 3 },
            topics: { label: 'Review 5 topics', target: 5 },
            notes: { label: 'Create 10 new notes', target: 10 },
        };
        const overrides = new Map((user?.weeklyGoals || []).map((g) => [g.metric, g]));
        const current = {
            flashcards: flashcardsThisWeek,
            quizzes: quizzesThisWeek,
            topics: topicsReviewed.length,
            notes: notesThisWeek,
        };
        return METRICS.map((metric) => {
            const override = overrides.get(metric);
            const label = override?.label ?? defaults[metric].label;
            const target = override?.target ?? defaults[metric].target;
            return { metric, goal: label, current: Math.min(target, current[metric]), total: target };
        });
    }
    async updateGoals(userId, goals) {
        const valid = ['flashcards', 'quizzes', 'topics', 'notes'];
        const seen = new Set();
        for (const g of goals) {
            if (!valid.includes(g.metric) || seen.has(g.metric))
                throw new Error(`Invalid or duplicate metric: ${g.metric}`);
            if (!g.label?.trim())
                throw new Error('Each goal needs a label');
            if (!Number.isInteger(g.target) || g.target < 1 || g.target > 1000)
                throw new Error('Target must be 1-1000');
            seen.add(g.metric);
        }
        await this.userModel.findByIdAndUpdate(userId, { weeklyGoals: goals });
        return goals;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(note_schema_1.NOTE_MODEL)),
    __param(2, (0, mongoose_1.InjectModel)(flashcard_schema_1.FLASHCARD_MODEL)),
    __param(3, (0, mongoose_1.InjectModel)(quiz_schema_1.QUIZ_MODEL)),
    __param(4, (0, mongoose_1.InjectModel)(study_session_schema_1.STUDY_SESSION_MODEL)),
    __param(5, (0, mongoose_1.InjectModel)(user_schema_1.USER_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map