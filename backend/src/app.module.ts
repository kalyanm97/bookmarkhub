import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './config/ormconfig';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { VotesModule } from './votes/votes.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(ormConfig),
		UsersModule,
		AuthModule,
		BookmarksModule,
		VotesModule,
	],
})
export class AppModule { /* Nest application module */ }