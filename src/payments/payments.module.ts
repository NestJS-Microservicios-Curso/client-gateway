import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
