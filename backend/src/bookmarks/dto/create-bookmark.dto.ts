import { IsString, IsUrl, Length } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsUrl({ require_protocol: true }, { message: 'URL must start with http:// or https://' })
  url!: string;
}