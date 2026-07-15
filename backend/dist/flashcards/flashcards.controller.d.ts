import { FlashcardsService } from './flashcards.service';
export declare class FlashcardsController {
    private readonly flashcardsService;
    constructor(flashcardsService: FlashcardsService);
    importPlaceholder(): any[];
    getAll(userId: string, topicId?: string): Promise<(import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[] | import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {
        topicId: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
        };
    }, Omit<import("../common/schemas/flashcard.schema").IFlashcardDocument, "topicId"> & {
        topicId: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
        };
    }, import("../common/schemas/flashcard.schema").IFlashcardDocument>[]>;
    getById(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    importBulk(body: {
        topicId: string;
        flashcards: any[];
    }, userId: string): Promise<(Omit<import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, string | number | symbol> & Omit<any, "_id">)[]>;
    review(id: string, body: {
        quality: number;
    }, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/flashcard.schema").IFlashcardDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/flashcard.schema").IFlashcardDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
}
