import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TopicSchema, TOPIC_MODEL } from '../common/schemas/topic.schema';
import { UserSchema, USER_MODEL } from '../common/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: TOPIC_MODEL, schema: TopicSchema },
    { name: USER_MODEL, schema: UserSchema },
  ])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
