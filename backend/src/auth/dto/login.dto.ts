import { IsString, MinLength } from 'class-validator';

export class LoginDto {
	// identifier can be email or username
	@IsString()
	identifier!: string;

	@IsString()
	@MinLength(6)
	password!: string;
}
