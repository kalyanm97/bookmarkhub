import { IsEmail, IsString, MinLength, Matches, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Username is required and must be unique
  @IsString()
  @Length(2, 32)
  @Matches(/^[a-z0-9_]+$/i, { message: 'Username can contain letters, numbers, and _ only' })
  username!: string;
}