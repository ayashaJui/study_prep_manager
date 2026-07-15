"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const search_controller_1 = require("./search.controller");
const search_service_1 = require("./search.service");
const topic_schema_1 = require("../common/schemas/topic.schema");
const note_schema_1 = require("../common/schemas/note.schema");
const flashcard_schema_1 = require("../common/schemas/flashcard.schema");
const quiz_schema_1 = require("../common/schemas/quiz.schema");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([
                { name: topic_schema_1.TOPIC_MODEL, schema: topic_schema_1.TopicSchema },
                { name: note_schema_1.NOTE_MODEL, schema: note_schema_1.NoteSchema },
                { name: flashcard_schema_1.FLASHCARD_MODEL, schema: flashcard_schema_1.FlashcardSchema },
                { name: quiz_schema_1.QUIZ_MODEL, schema: quiz_schema_1.QuizSchema },
            ])],
        controllers: [search_controller_1.SearchController],
        providers: [search_service_1.SearchService],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map