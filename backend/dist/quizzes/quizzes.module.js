"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const quizzes_controller_1 = require("./quizzes.controller");
const quizzes_service_1 = require("./quizzes.service");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
const topic_schema_1 = require("../common/schemas/topic.schema");
const study_session_schema_1 = require("../common/schemas/study-session.schema");
let QuizzesModule = class QuizzesModule {
};
exports.QuizzesModule = QuizzesModule;
exports.QuizzesModule = QuizzesModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([
                { name: quiz_schema_1.QUIZ_MODEL, schema: quiz_schema_1.QuizSchema },
                { name: topic_schema_1.TOPIC_MODEL, schema: topic_schema_1.TopicSchema },
                { name: study_session_schema_1.STUDY_SESSION_MODEL, schema: study_session_schema_1.StudySessionSchema },
            ])],
        controllers: [quizzes_controller_1.QuizzesController],
        providers: [quizzes_service_1.QuizzesService],
    })
], QuizzesModule);
//# sourceMappingURL=quizzes.module.js.map