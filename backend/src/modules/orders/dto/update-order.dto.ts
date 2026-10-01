import { PartialType } from '@nestjs/mapped-types';
import { OrderStatus, PaymentStatus } from '@queenscut/shared';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNumber()
  @Min(0)
  @IsOptional()
  balanceDue?: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
