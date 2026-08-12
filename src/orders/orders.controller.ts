import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { CreateOrderDto, StatusDto } from './dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from '../common';
import { NATS_SERVICE } from '../config';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrder', createOrderDto).pipe(
      catchError((error) => {
        throw new RpcException(error as object);
      }),
    );
  }

  @Get()
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.client.send('findAllOrders', orderPaginationDto).pipe(
      catchError((error) => {
        throw new RpcException(error as object);
      }),
    );
  }

  @Get('id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneOrder', { id }).pipe(
      catchError((error) => {
        throw new RpcException(error as object);
      }),
    );
  }

  @Get(':status')
  findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.client
      .send('findAllByStatus', { ...statusDto, ...paginationDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error as object);
        }),
      );
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    return this.client.send('changeOrderStatus', { id, ...statusDto }).pipe(
      catchError((error) => {
        throw new RpcException(error as object);
      }),
    );
  }
}
