/**
 * E2E smoke tests for the client-gateway.
 *
 * The gateway has no business logic of its own – it proxies every request to
 * downstream microservices over NATS. Booting the real AppModule in tests
 * requires live NATS servers and valid env vars, which are not available in a
 * plain `npm run test:e2e` environment.
 */

// Mock envs before any module import touches the Joi validation at module level.
jest.mock('../src/config/envs', () => ({
  envs: {
    port: 3000,
    natsServers: ['nats://localhost:4222'],
  },
}));

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { of } from 'rxjs';
import {
  afterAll,
  beforeAll,
  describe,
  it,
  afterEach,
  jest,
} from '@jest/globals';

import { ProductsController } from '../src/products/products.controller';
import { OrdersController } from '../src/orders/orders.controller';
import { PaymentsController } from '../src/payments/payments.controller';
import { RpcCustomExceptionFilter } from '../src/common/exceptions/rpc-custom-exception.filter';
import { NATS_SERVICE } from '../src/config';

// Minimal stub: every send() returns an empty observable so routes resolve.
const mockClientProxy = {
  send: jest.fn().mockReturnValue(of({})),
  emit: jest.fn(),
};

describe('Client-Gateway (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController, OrdersController, PaymentsController],
      providers: [{ provide: NATS_SERVICE, useValue: mockClientProxy }],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new RpcCustomExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Products routes', () => {
    it('GET /api/products returns 200', () => {
      mockClientProxy.send.mockReturnValue(of({ data: [], meta: {} }));
      return request(app.getHttpServer()).get('/api/products').expect(200);
    });
  });

  describe('Orders routes', () => {
    it('GET /api/orders returns 200', () => {
      mockClientProxy.send.mockReturnValue(of({ data: [], meta: {} }));
      return request(app.getHttpServer()).get('/api/orders').expect(200);
    });
  });

  describe('Payments routes', () => {
    it('GET /api/payments/success returns { ok: true }', () => {
      return request(app.getHttpServer())
        .get('/api/payments/success')
        .expect(200)
        .expect({ ok: true, message: 'Payment successful' });
    });

    it('GET /api/payments/cancel returns { ok: false }', () => {
      return request(app.getHttpServer())
        .get('/api/payments/cancel')
        .expect(200)
        .expect({ ok: false, message: 'Payment canceled' });
    });
  });
});
