import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsString,
  IsDateString
} from "class-validator";
import { OrderStatus, PaymentMethod, PaymentsStatus } from '../../../generated/prisma';

export class OrderDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsNumber()
  total: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsUUID()
  clientId: string;

  @IsEnum(PaymentsStatus)
  paymentStatus: PaymentsStatus;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsDateString()
  @IsOptional()
  fulfilledAt?: Date;

  @IsUUID()
  businessId: string;
}