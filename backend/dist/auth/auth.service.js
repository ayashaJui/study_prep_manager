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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const user_schema_1 = require("../common/schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService, config) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.config = config;
    }
    generateToken(userId) {
        return this.jwtService.sign({ userId });
    }
    buildCookieHeader(token) {
        const isProd = this.config.get('NODE_ENV') === 'production';
        const secure = isProd ? '; Secure' : '';
        const sameSite = isProd ? 'Strict' : 'Lax';
        const maxAge = isProd ? 60 * 60 * 24 : 60 * 60 * 24 * 7;
        return `auth_token=${token}; Path=/; HttpOnly${secure}; SameSite=${sameSite}; Max-Age=${maxAge}`;
    }
    buildClearCookieHeader() {
        const isProd = this.config.get('NODE_ENV') === 'production';
        const secure = isProd ? '; Secure' : '';
        const sameSite = isProd ? 'Strict' : 'Lax';
        return `auth_token=; Path=/; HttpOnly${secure}; SameSite=${sameSite}; Max-Age=0`;
    }
    async login(email, password) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (!user.password)
            throw new common_1.UnauthorizedException('Please login using your social account');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const token = this.generateToken(user._id.toString());
        return {
            cookie: this.buildCookieHeader(token),
            data: { user: { id: user._id, name: user.name, email: user.email }, token },
        };
    }
    async register(name, email, password, confirmPassword) {
        if (password !== confirmPassword)
            throw new common_1.BadRequestException('Passwords do not match');
        const existing = await this.userModel.findOne({ email: email.toLowerCase() });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const hashed = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({
            name,
            email: email.toLowerCase(),
            password: hashed,
            provider: 'credentials',
            emailVerified: true,
        });
        const token = this.generateToken(user._id.toString());
        return {
            cookie: this.buildCookieHeader(token),
            data: { user: { id: user._id, name: user.name, email: user.email }, token },
        };
    }
    async getMe(userId) {
        const user = await this.userModel.findById(userId).select('-password');
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return { user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider } };
    }
    async getProfile(userId) {
        const user = await this.userModel.findById(userId).select('-password -resetToken -resetTokenExpiry -verificationToken');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async forgotPassword(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            return { message: 'If an account exists, a password reset email has been sent' };
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetToken = resetTokenHash;
        user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        const appUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;
        const emailUser = this.config.get('EMAIL_USER');
        const emailPass = this.config.get('EMAIL_PASSWORD');
        if (emailUser && emailPass) {
            const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
            await transporter.sendMail({
                from: emailUser,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password. It expires in 10 minutes.</p>
          <a href="${resetLink}" style="background:#667eea;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px">Reset Password</a>
          <p>If you didn't request this, ignore this email.</p>
        `,
            });
        }
        return { message: 'If an account exists, a password reset email has been sent' };
    }
    async resetPassword(token, password, confirmPassword) {
        if (password !== confirmPassword)
            throw new common_1.BadRequestException('Passwords do not match');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.userModel.findOne({ resetToken: hash, resetTokenExpiry: { $gt: new Date() } });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        user.password = await bcrypt.hash(password, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        return { message: 'Password reset successfully. Please login with your new password.' };
    }
    async changePassword(userId, currentPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword)
            throw new common_1.BadRequestException('Passwords do not match');
        const user = await this.userModel.findById(userId).select('+password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.password)
            throw new common_1.BadRequestException('Cannot change password for social login accounts');
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return { message: 'Password changed successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.USER_MODEL)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map