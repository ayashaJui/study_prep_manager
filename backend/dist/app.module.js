"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const topics_module_1 = require("./topics/topics.module");
const notes_module_1 = require("./notes/notes.module");
const flashcards_module_1 = require("./flashcards/flashcards.module");
const quizzes_module_1 = require("./quizzes/quizzes.module");
const problems_module_1 = require("./problems/problems.module");
const study_sessions_module_1 = require("./study-sessions/study-sessions.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const search_module_1 = require("./search/search.module");
const public_module_1 = require("./public/public.module");
const upload_module_1 = require("./upload/upload.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            topics_module_1.TopicsModule,
            notes_module_1.NotesModule,
            flashcards_module_1.FlashcardsModule,
            quizzes_module_1.QuizzesModule,
            problems_module_1.ProblemsModule,
            study_sessions_module_1.StudySessionsModule,
            dashboard_module_1.DashboardModule,
            search_module_1.SearchModule,
            public_module_1.PublicModule,
            upload_module_1.UploadModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map