import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, OrderStatusList } from '../enum/order.enum';
import { PaginationDto } from '../../common';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Valid status values are: ${Object.values(OrderStatusList).join(', ')}`,
  })
  status?: OrderStatus;
}
