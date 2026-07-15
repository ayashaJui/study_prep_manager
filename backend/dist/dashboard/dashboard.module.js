"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const topic_schema_1 = require("../common/schemas/topic.schema");
const note_schema_1 = require("../common/schemas/note.schema");
const flashcard_schema_1 = require("../common/schemas/flashcard.schema");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
const study_session_schema_1 = require("../common/schemas/study-session.schema");
const user_schema_1 = require("../common/schemas/user.schema");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([
                { name: topic_schema_1.TOPIC_MODEL, schema: topic_schema_1.TopicSchema },
                { name: note_schema_1.NOTE_MODEL, schema: note_schema_1.NoteSchema },
                { name: flashcard_schema_1.FLASHCARD_MODEL, schema: flashcard_schema_1.FlashcardSchema },
                { name: quiz_schema_1.QUIZ_MODEL, schema: quiz_schema_1.QuizSchema },
                { name: study_session_schema_1.STUDY_SESSION_MODEL, schema: study_session_schema_1.StudySessionSchema },
                { name: user_schema_1.USER_MODEL, schema: user_schema_1.UserSchema },
            ])],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map