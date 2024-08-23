import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchTutorialDto {
  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  pageSize?: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  pageNumber?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  createdAt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  updatedAt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  title?: string;
}
