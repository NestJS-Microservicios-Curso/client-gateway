import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [ProductsController],
  providers: [],
  // Registering the NatsModule to enable communication with the NATS microservice
  imports: [NatsModule],
})
export class ProductsModule {}
