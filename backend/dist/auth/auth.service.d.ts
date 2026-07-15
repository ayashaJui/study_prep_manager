import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { IUserDocument } from '../common/schemas/user.schema';
export declare class AuthService {
    private userModel;
    private jwtService;
    private config;
    constructor(userModel: Model<IUserDocument>, jwtService: JwtService, config: ConfigService);
    private generateToken;
    private buildCookieHeader;
    buildClearCookieHeader(): string;
    login(email: string, password: string): Promise<{
        cookie: string;
        data: {
            user: {
                id: import("mongoose").Types.ObjectId;
                name: string;
                email: string;
            };
            token: string;
        };
    }>;
    register(name: string, email: string, password: string, confirmPassword: string): Promise<{
        cookie: string;
        data: {
            user: {
                id: import("mongoose").Types.ObjectId;
                name: string;
                email: string;
            };
            token: string;
        };
    }>;
    getMe(userId: string): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            avatar: string;
            provider: string;
        };
    }>;
    getProfile(userId: string): Promise<import("mongoose").Document<unknown, {}, IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & IUserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, password: string, confirmPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<{
        message: string;
    }>;
}
