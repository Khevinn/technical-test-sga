import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchTutorialDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  pageSize?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  pageNumber?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  startDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  startUpdatedDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  endUpdatedDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  endDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  title?: string;
}
