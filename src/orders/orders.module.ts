import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, ORDERS_SERVICE } from '../config';

@Module({
  controllers: [OrdersController],
  imports: [
    // Registering a microservice client
    ClientsModule.register([
      {
        name: ORDERS_SERVICE, // Name of the microservice client
        transport: Transport.TCP, // Using TCP transport, the communication channel between the gateway and the microservice will be TCP
        options: {
          host: envs.ordersMicroservice.host, // Host where the microservice is running
          port: envs.ordersMicroservice.port, // Port on which the microservice is listening
        },
      },
    ]),
  ],
})
export class OrdersModule {}
