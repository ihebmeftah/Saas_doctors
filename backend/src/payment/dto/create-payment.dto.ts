import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
    @IsUUID()
    facturatationId: string;

    @IsNumber()
    amount: number;

    @IsString()
    paymentMethod: string;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
