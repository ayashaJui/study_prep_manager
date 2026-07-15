import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(userId: string, query?: string, limit?: string): Promise<{
        topics: (import("../common/schemas/topic.schema").ITopicDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        notes: (import("../common/schemas/note.schema").INoteDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        flashcards: (import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        quizzes: (import("../common/schemas/quiz.schema").IQuizDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        topicMap: Record<string, {
            path: string[];
            level: number;
        }>;
    }>;
}
