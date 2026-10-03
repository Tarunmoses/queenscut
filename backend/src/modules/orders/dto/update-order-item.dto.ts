import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderItemDto {
  @IsString()
  @IsOptional()
  apparelType?: string;

  @IsObject()
  @IsOptional()
  measurements?: Record<string, number | string>;

  @IsString()
  @IsOptional()
  designNotes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amountCharged?: number;
}
