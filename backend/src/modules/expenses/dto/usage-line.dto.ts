import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UsageLineDto {
  @IsString()
  @IsNotEmpty()
  inventoryItemId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;
}
