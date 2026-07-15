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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const topic_schema_1 = require("../common/schemas/topic.schema");
const note_schema_1 = require("../common/schemas/note.schema");
const flashcard_schema_1 = require("../common/schemas/flashcard.schema");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
let SearchService = class SearchService {
    constructor(topicModel, noteModel, flashcardModel, quizModel) {
        this.topicModel = topicModel;
        this.noteModel = noteModel;
        this.flashcardModel = flashcardModel;
        this.quizModel = quizModel;
    }
    async search(userId, query, limit = 10) {
        if (query.length < 2)
            return { topics: [], notes: [], flashcards: [], quizzes: [], topicMap: {} };
        const regex = new RegExp(escapeRegExp(query), 'i');
        const cap = Math.min(limit, 25);
        const [topics, notes, flashcards, quizzes] = await Promise.all([
            this.topicModel.find({ userId, $or: [{ name: regex }, { description: regex }, { slug: regex }, { tags: regex }] }).select('name slug description status stats').sort({ createdAt: -1 }).limit(cap).lean(),
            this.noteModel.find({ userId, $or: [{ content: regex }, { tags: regex }] }).select('content topicId').sort({ createdAt: -1 }).limit(cap).lean(),
            this.flashcardModel.find({ userId, $or: [{ front: regex }, { back: regex }, { tags: regex }] }).select('front back topicId').sort({ createdAt: -1 }).limit(cap).lean(),
            this.quizModel.find({ userId, $or: [{ title: regex }, { description: regex }, { tags: regex }, { 'questions.question': regex }] }).select('title description topicId').sort({ createdAt: -1 }).limit(cap).lean(),
        ]);
        const ids = new Set();
        topics.forEach((t) => ids.add(String(t._id)));
        notes.forEach((n) => n.topicId && ids.add(String(n.topicId)));
        flashcards.forEach((f) => f.topicId && ids.add(String(f.topicId)));
        quizzes.forEach((q) => q.topicId && ids.add(String(q.topicId)));
        const topicMap = {};
        if (ids.size > 0) {
            const docs = await this.topicModel.find({ _id: { $in: Array.from(ids) } }).select('_id path level').lean();
            docs.forEach((t) => { topicMap[String(t._id)] = { path: (t.path || []).map(String), level: t.level ?? 0 }; });
        }
        return { topics, notes, flashcards, quizzes, topicMap };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(topic_schema_1.TOPIC_MODEL)),
    __param(1, (0, mongoose_1.InjectModel)(note_schema_1.NOTE_MODEL)),
    __param(2, (0, mongoose_1.InjectModel)(flashcard_schema_1.FLASHCARD_MODEL)),
    __param(3, (0, mongoose_1.InjectModel)(quiz_schema_1.QUIZ_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SearchService);
//# sourceMappingURL=search.service.js.map