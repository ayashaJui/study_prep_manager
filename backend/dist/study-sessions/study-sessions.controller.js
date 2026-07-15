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
exports.StudySessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const study_sessions_service_1 = require("./study-sessions.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let StudySessionsController = class StudySessionsController {
    constructor(studySessionsService) {
        this.studySessionsService = studySessionsService;
    }
    getStreak(userId, tz) {
        return this.studySessionsService.getStreak(userId, tz);
    }
    async getHistory(userId, res, limit, page) {
        const result = await this.studySessionsService.getHistory(userId, limit ? parseInt(limit) : 10, page ? parseInt(page) : 1);
        res.json({ success: true, data: result.sessions, pagination: result.pagination });
    }
    create(body, userId) {
        return this.studySessionsService.create(userId, body);
    }
};
exports.StudySessionsController = StudySessionsController;
__decorate([
    (0, common_1.Get)('streak'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('tz')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "getStreak", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], StudySessionsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "create", null);
exports.StudySessionsController = StudySessionsController = __decorate([
    (0, swagger_1.ApiTags)('Study Sessions'),
    (0, swagger_1.ApiCookieAuth)('auth_token'),
    (0, common_1.Controller)('study-sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [study_sessions_service_1.StudySessionsService])
], StudySessionsController);
//# sourceMappingURL=study-sessions.controller.js.map