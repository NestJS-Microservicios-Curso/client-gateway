import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import type { Request } from 'express';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from '../config';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @Post('webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody || !signature) {
      throw new BadRequestException(
        'Missing raw body or stripe-signature header',
      );
    }

    // Convert the raw body to a base64 string before sending it to the microservice for verification.
    // This is necessary because the raw body is a Buffer, and we need to ensure that it can be transmitted over the network without any data loss or corruption.
    return this.client
      .send('verify.stripe.webhook', {
        rawBody: req.rawBody.toString('base64'),
        signature,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error as object);
        }),
      );
  }

  @Get('success')
  success() {
    return { ok: true, message: 'Payment successful' };
  }

  @Get('cancel')
  cancel() {
    return { ok: false, message: 'Payment canceled' };
  }
}
