import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [OrdersController],
  providers: [],
  // Registering the NatsModule to enable communication with the NATS microservice
  imports: [NatsModule],
})
export class OrdersModule {}
