# Client Gateway (`client-gateway`)

An API Gateway built with NestJS that serves as the single entry point for clients, translating REST HTTP requests into microservice TCP communications.

## Features

- **API Gateway Pattern**: Single entry point (`/api`) routing client requests to backend microservices.
- **REST to TCP Proxy**: Forwards HTTP endpoints to internal microservices (`products-ms` and `orders-ms`) via NestJS `@nestjs/microservices` ClientProxy TCP transport.
- **Order & OrderItem Integration**: Supports creating and fetching orders with nested `OrderItem` line items, returning enriched product details (product names and validated prices) fetched from `products-ms`.
- **Validation**: Global `ValidationPipe` with strict DTO validation using `class-validator` and `class-transformer`.
- **Environment Configuration**: Environment variables validated using `joi`.
- **Global Error Handling**: Custom RPC Exception Filter (`RpcCustomExceptionFilter`) mapping microservice RPC errors to standard HTTP responses.

---

## Environment Variables

Copy `.env.template` to `.env` and set your configuration variables:

```bash
cp .env.template .env
```

Default variables:

| Variable                | Description                    | Default Value |
| ----------------------- | ------------------------------ | ------------- |
| `PORT`                  | API Gateway HTTP Port          | `3000`        |
| `PRODUCTS_SERVICE_HOST` | Products Microservice Host     | `localhost`   |
| `PRODUCTS_SERVICE_PORT` | Products Microservice TCP Port | `3001`        |
| `ORDERS_SERVICE_HOST`   | Orders Microservice Host       | `localhost`   |
| `ORDERS_SERVICE_PORT`   | Orders Microservice TCP Port   | `3002`        |

---

## Installation & Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

---

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

---

## REST API Endpoints

All endpoints are prefixed with `/api`.

### Products Module (`/api/products`)

| Method   | Endpoint            | Body / Query                             | Target Microservice Pattern | Description                                 |
| -------- | ------------------- | ---------------------------------------- | --------------------------- | ------------------------------------------- |
| `POST`   | `/api/products`     | `CreateProductDto` (`{ name, price }`)   | `create_product`            | Creates a new product                       |
| `GET`    | `/api/products`     | `PaginationDto` (`{ page?, limit? }`)    | `find_all_products`         | Retrieves paginated list of active products |
| `GET`    | `/api/products/:id` | -                                        | `find_one_product`          | Fetches a single product by ID              |
| `PATCH`  | `/api/products/:id` | `UpdateProductDto` (`{ name?, price? }`) | `update_product`            | Updates product fields by ID                |
| `DELETE` | `/api/products/:id` | -                                        | `delete_product`            | Soft deletes a product by ID                |

### Orders Module (`/api/orders`)

> **Note on Order Items**: Orders now contain nested `OrderItem` entities.
>
> - When creating an order (`POST /api/orders`), clients specify `items` as an array of `{ productId, quantity }` objects. Prices are not sent by the client; they are validated server-side against `products-ms`.
> - Responses for `POST /api/orders` and `GET /api/orders/id/:id` return the complete `Order` object including an `OrderItem` array enriched with product details (`productId`, `quantity`, `price`, and product `name`).

| Method  | Endpoint              | Body / Query                                              | Target Microservice Pattern | Description                                                                      |
| ------- | --------------------- | --------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| `POST`  | `/api/orders`         | `CreateOrderDto` (`{ items: [{ productId, quantity }] }`) | `createOrder`               | Creates a new order with `OrderItem` entries and returns enriched order details  |
| `GET`   | `/api/orders`         | `OrderPaginationDto` (`{ page?, limit?, status? }`)       | `findAllOrders`             | Retrieves paginated list of orders                                               |
| `GET`   | `/api/orders/id/:id`  | -                                                         | `findOneOrder`              | Fetches a single order by UUID including populated `OrderItem` details and names |
| `GET`   | `/api/orders/:status` | `PaginationDto` (`{ page?, limit? }`)                     | `findAllByStatus`           | Retrieves orders filtered by status (`PENDING`, `DELIVERED`, `CANCELLED`)        |
| `PATCH` | `/api/orders/:id`     | `StatusDto` (`{ status }`)                                | `changeOrderStatus`         | Updates order status by UUID                                                     |

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (HTTP API Gateway)
- **Transport**: REST (Express) to Microservices TCP ClientProxy
- **Validation**: `class-validator` & `class-transformer`
- **Error Handling**: Custom RPC Exception Filter
