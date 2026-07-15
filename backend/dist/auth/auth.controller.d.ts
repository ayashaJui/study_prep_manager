import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
        token: string;
    }>;
    register(dto: RegisterDto, res: Response): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
        token: string;
    }>;
    logout(res: Response): Promise<any>;
    getMe(userId: string): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            avatar: string;
            provider: string;
        };
    }>;
    getProfile(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/user.schema").IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/user.schema").IUserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(dto: ChangePasswordDto, userId: string): Promise<{
        message: string;
    }>;
}
