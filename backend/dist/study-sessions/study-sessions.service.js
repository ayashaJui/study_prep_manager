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
exports.StudySessionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const study_session_schema_1 = require("../common/schemas/study-session.schema");
const getDayKey = (date, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const isValidTimeZone = (tz) => {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    }
    catch {
        return false;
    }
};
let StudySessionsService = class StudySessionsService {
    constructor(sessionModel) {
        this.sessionModel = sessionModel;
    }
    async create(userId, data) {
        return this.sessionModel.create({ userId, topicId: data.topicId || null, activityType: data.activityType, duration: data.duration || 0, score: data.score });
    }
    async getHistory(userId, limit = 10, page = 1) {
        const query = { userId };
        const [sessions, total] = await Promise.all([
            this.sessionModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            this.sessionModel.countDocuments(query),
        ]);
        return { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async getStreak(userId, tz) {
        const timeZone = tz && isValidTimeZone(tz) ? tz : 'UTC';
        const sessions = await this.sessionModel.find({ userId }).sort({ createdAt: -1 }).select('createdAt');
        if (sessions.length === 0)
            return { streak: 0, lastStudyDate: null };
        const uniqueDays = [...new Set(sessions.map((s) => getDayKey(s.createdAt, timeZone)))].sort((a, b) => (a > b ? -1 : 1));
        const todayKey = getDayKey(new Date(), timeZone);
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayKey = getDayKey(yesterday, timeZone);
        if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey)
            return { streak: 0, lastStudyDate: uniqueDays[0] };
        let streak = 0;
        for (let i = 0; i < uniqueDays.length; i++) {
            const expected = new Date(`${uniqueDays[0]}T00:00:00Z`);
            expected.setUTCDate(expected.getUTCDate() - i);
            if (uniqueDays[i] === getDayKey(expected, timeZone))
                streak++;
            else
                break;
        }
        return { streak, lastStudyDate: uniqueDays[0] };
    }
};
exports.StudySessionsService = StudySessionsService;
exports.StudySessionsService = StudySessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(study_session_schema_1.STUDY_SESSION_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StudySessionsService);
//# sourceMappingURL=study-sessions.service.js.map