import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, PRODUCTS_SERVICE } from '../config';

@Module({
  controllers: [ProductsController],
  providers: [],
  imports: [
    // Registering a microservice client
    ClientsModule.register([
      {
        name: PRODUCTS_SERVICE, // Name of the microservice client
        transport: Transport.TCP, // Using TCP transport, the communication channel between the gateway and the microservice will be TCP
        options: {
          host: envs.productsMicroservice.host, // Host where the microservice is running
          port: envs.productsMicroservice.port, // Port on which the microservice is listening
        },
      },
    ]),
  ],
})
export class ProductsModule {}
