import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [AuthController],
  providers: [],
  // Registering the NatsModule to enable communication with the NATS microservice
  imports: [NatsModule],
})
export class AuthModule {}
