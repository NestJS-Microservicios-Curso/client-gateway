# Client Gateway (`client-gateway`)

An API Gateway built with NestJS that serves as the **single inbound HTTP entry point** for all clients, translating REST HTTP requests into asynchronous and request-reply communications over **NATS Messaging**.

## Features

- **Single Ingress / API Gateway Pattern**: Single entry point (`/api`) routing external client traffic to backend microservices.
- **REST to NATS Proxy**: Seamlessly proxies HTTP requests to internal microservices (`products-ms`, `orders-ms`, `payments-ms`) via NestJS NATS `ClientProxy`.
- **Raw Body Ingestion for Webhooks**: Configured with `rawBody: true` to ingest binary webhook payloads and forward Base64 representations to `payments-ms` for cryptographic HMAC-SHA256 signature verification.
- **Strict Validation**: Global `ValidationPipe` with DTO validation using `class-validator` and `class-transformer`.
- **Centralized Error Handling**: Custom RPC Exception Filter (`RpcCustomExceptionFilter`) translating microservice exceptions into consistent HTTP responses.

---

## Environment Variables

Copy `.env.template` to `.env` and set your configuration variables:

```bash
cp .env.template .env
```

| Variable       | Description                              | Default Value           |
| :------------- | :--------------------------------------- | :---------------------- |
| `PORT`         | API Gateway HTTP Port                    | `3000`                  |
| `NATS_SERVERS` | Comma-separated list of NATS broker URLs | `nats://localhost:4222` |

---

## REST API Endpoints

All endpoints are prefixed with `/api`.

### 🛍️ Products (`/api/products`)

| Method   | Endpoint            | Body / Query                             | Target NATS Pattern | Description                         |
| :------- | :------------------ | :--------------------------------------- | :------------------ | :---------------------------------- |
| `POST`   | `/api/products`     | `CreateProductDto` (`{ name, price }`)   | `create_product`    | Creates a new product               |
| `GET`    | `/api/products`     | `PaginationDto` (`{ page?, limit? }`)    | `find_all_products` | Retrieves paginated active products |
| `GET`    | `/api/products/:id` | -                                        | `find_one_product`  | Fetches a single product by ID      |
| `PATCH`  | `/api/products/:id` | `UpdateProductDto` (`{ name?, price? }`) | `update_product`    | Updates product fields by ID        |
| `DELETE` | `/api/products/:id` | -                                        | `delete_product`    | Soft-deletes a product by ID        |

### 📦 Orders (`/api/orders`)

| Method  | Endpoint              | Body / Query                                              | Target NATS Pattern | Description                                                                                                                               |
| :------ | :-------------------- | :-------------------------------------------------------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`  | `/api/orders`         | `CreateOrderDto` (`{ items: [{ productId, quantity }] }`) | `createOrder`       | Creates an order in PostgreSQL, validates items with Products, and creates Stripe Checkout session (returns order + `paymentSession.url`) |
| `GET`   | `/api/orders`         | `OrderPaginationDto` (`{ page?, limit?, status? }`)       | `findAllOrders`     | Retrieves paginated list of orders                                                                                                        |
| `GET`   | `/api/orders/id/:id`  | -                                                         | `findOneOrder`      | Fetches a single order by UUID with populated item details and product names                                                              |
| `GET`   | `/api/orders/:status` | `PaginationDto` (`{ page?, limit? }`)                     | `findAllByStatus`   | Retrieves orders filtered by status (`PENDING`, `PAID`, `DELIVERED`, `CANCELLED`)                                                         |
| `PATCH` | `/api/orders/:id`     | `StatusDto` (`{ status }`)                                | `changeOrderStatus` | Updates order status by UUID                                                                                                              |

### 💳 Payments (`/api/payments`)

| Method | Endpoint                | Body / Headers                       | Target NATS Pattern     | Description                                                                                       |
| :----- | :---------------------- | :----------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------ |
| `POST` | `/api/payments/webhook` | Raw Body + `stripe-signature` Header | `verify.stripe.webhook` | Receives Stripe webhook, converts raw body to base64, and delegates verification to `payments-ms` |
| `GET`  | `/api/payments/success` | -                                    | Local Gateway response  | Payment success redirect landing page                                                             |
| `GET`  | `/api/payments/cancel`  | -                                    | Local Gateway response  | Payment cancellation redirect landing page                                                        |

---

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (HTTP API Gateway)
- **Transport**: NATS Message Broker (`@nestjs/microservices`)
- **Validation**: `class-validator` & `class-transformer`
- **Error Handling**: Custom RPC Exception Filter
