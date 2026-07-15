import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserSchema, USER_MODEL } from '../common/schemas/user.schema';

@Module({
  imports: [
    PassportModule,
    // Register the Mongoose User model so it can be injected in AuthService
    MongooseModule.forFeature([{ name: USER_MODEL, schema: UserSchema }]),
    // JwtModule sets up the JWT signing secret and expiry
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-insecure-default-change-me',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Export JwtAuthGuard strategy so other modules can use @UseGuards(JwtAuthGuard)
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
