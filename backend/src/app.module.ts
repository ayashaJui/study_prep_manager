/**
 * NESTJS CONCEPT — MODULE
 *
 * A Module is a class decorated with @Module(). It's how NestJS organises
 * your application. Think of it like a folder that groups related things
 * (controller, service, models) together.
 *
 * AppModule is the ROOT module — the entry point. Every other module is
 * imported here so NestJS knows they exist.
 *
 * imports   → other modules this module depends on
 * providers → services / classes that can be injected (dependency injection)
 * controllers → handle HTTP requests
 * exports   → what this module exposes to other modules
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TopicsModule } from './topics/topics.module';
import { NotesModule } from './notes/notes.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { ProblemsModule } from './problems/problems.module';
import { StudySessionsModule } from './study-sessions/study-sessions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SearchModule } from './search/search.module';
import { PublicModule } from './public/public.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ConfigModule loads .env variables and makes them available via ConfigService
    ConfigModule.forRoot({ isGlobal: true }),

    // ThrottlerModule is NestJS's built-in rate limiter
    // ttl = time window in milliseconds, limit = max requests per window
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    DatabaseModule,
    AuthModule,
    TopicsModule,
    NotesModule,
    FlashcardsModule,
    QuizzesModule,
    ProblemsModule,
    StudySessionsModule,
    DashboardModule,
    SearchModule,
    PublicModule,
    UploadModule,
  ],
})
export class AppModule {}
