import { NotesService } from './notes.service';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    getPinned(userId: string): Promise<(import("mongoose").Document<unknown, {}, import("../common/schemas/note.schema").INoteDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/note.schema").INoteDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(userId: string, topicId: string): Promise<(import("mongoose").Document<unknown, {}, import("../common/schemas/note.schema").INoteDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/note.schema").INoteDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/note.schema").INoteDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/note.schema").INoteDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/note.schema").INoteDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/note.schema").INoteDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/note.schema").INoteDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/note.schema").INoteDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
}
