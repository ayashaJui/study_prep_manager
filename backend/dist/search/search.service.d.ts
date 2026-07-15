import { Model } from 'mongoose';
import { ITopicDocument } from '../common/schemas/topic.schema';
import { INoteDocument } from '../common/schemas/note.schema';
import { IFlashcardDocument } from '../common/schemas/flashcard.schema';
import { IQuizDocument } from '../common/schemas/quiz.schema';
export declare class SearchService {
    private topicModel;
    private noteModel;
    private flashcardModel;
    private quizModel;
    constructor(topicModel: Model<ITopicDocument>, noteModel: Model<INoteDocument>, flashcardModel: Model<IFlashcardDocument>, quizModel: Model<IQuizDocument>);
    search(userId: string, query: string, limit?: number): Promise<{
        topics: (ITopicDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        notes: (INoteDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        flashcards: (IFlashcardDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        quizzes: (IQuizDocument & Required<{
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
