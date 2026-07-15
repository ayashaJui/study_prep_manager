import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { ProblemSchema, PROBLEM_MODEL } from '../common/schemas/problem.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PROBLEM_MODEL, schema: ProblemSchema }])],
  controllers: [ProblemsController],
  providers: [ProblemsService],
})
export class ProblemsModule {}
