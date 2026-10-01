import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  apparelType: string;

  @IsObject()
  @IsOptional()
  measurements?: Record<string, number | string>;

  @IsString()
  @IsOptional()
  designNotes?: string;

  @IsNumber()
  @Min(0)
  amountCharged: number;
}
