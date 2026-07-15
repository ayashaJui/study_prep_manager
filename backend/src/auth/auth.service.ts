/**
 * NESTJS CONCEPT — SERVICE
 *
 * A Service is a class decorated with @Injectable() that holds business logic.
 * Controllers stay thin (just parse the request and call the service).
 * Services contain the actual work: database queries, hashing, emails, etc.
 *
 * Services are injected into controllers via the constructor — this is
 * Dependency Injection (DI). NestJS creates and manages the instances for you.
 */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { IUserDocument, USER_MODEL } from '../common/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    // @InjectModel injects the Mongoose model for a schema.
    // InjectModel(USER_MODEL) gives us the Mongoose User model to query MongoDB.
    @InjectModel(USER_MODEL) private userModel: Model<IUserDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── helpers ──────────────────────────────────────────────────────────────

  private generateToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  private buildCookieHeader(token: string): string {
    const isProd = this.config.get('NODE_ENV') === 'production';
    const secure = isProd ? '; Secure' : '';
    // SameSite=None is required for cross-origin cookies (frontend and backend on different domains).
    // SameSite=None MUST be paired with Secure.
    const sameSite = isProd ? 'None' : 'Lax';
    const maxAge = isProd ? 60 * 60 * 24 * 7 : 60 * 60 * 24 * 7;
    return `auth_token=${token}; Path=/; HttpOnly${secure}; SameSite=${sameSite}; Max-Age=${maxAge}`;
  }

  buildClearCookieHeader(): string {
    const isProd = this.config.get('NODE_ENV') === 'production';
    const secure = isProd ? '; Secure' : '';
    const sameSite = isProd ? 'None' : 'Lax';
    return `auth_token=; Path=/; HttpOnly${secure}; SameSite=${sameSite}; Max-Age=0`;
  }

  // ── login ────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.password) throw new UnauthorizedException('Please login using your social account');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const token = this.generateToken(user._id.toString());
    return {
      cookie: this.buildCookieHeader(token),
      data: { user: { id: user._id, name: user.name, email: user.email }, token },
    };
  }

  // ── register ─────────────────────────────────────────────────────────────

  async register(name: string, email: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) throw new BadRequestException('Passwords do not match');

    const existing = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      provider: 'credentials',
      emailVerified: true,
    } as any);

    const token = this.generateToken(user._id.toString());
    return {
      cookie: this.buildCookieHeader(token),
      data: { user: { id: user._id, name: user.name, email: user.email }, token },
    };
  }

  // ── me ───────────────────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new UnauthorizedException('User not found');
    return { user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider } };
  }

  // ── profile ──────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password -resetToken -resetTokenExpiry -verificationToken');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ── forgot password ──────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    // Always return success to not reveal whether the email exists
    if (!user) return { message: 'If an account exists, a password reset email has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
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

  // ── reset password ───────────────────────────────────────────────────────

  async resetPassword(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) throw new BadRequestException('Passwords do not match');

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel.findOne({ resetToken: hash, resetTokenExpiry: { $gt: new Date() } });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return { message: 'Password reset successfully. Please login with your new password.' };
  }

  // ── change password ──────────────────────────────────────────────────────

  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) throw new BadRequestException('Passwords do not match');

    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) throw new BadRequestException('Cannot change password for social login accounts');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
