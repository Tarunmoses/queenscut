import { InventoryStatus } from '@queenscut/shared';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  unitType: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsDateString()
  @IsOptional()
  lastUsedDate?: string;

  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;
}
