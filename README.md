# Client Gateway (`client-gateway`)

An API Gateway built with NestJS that serves as the single entry point for clients, translating REST HTTP requests into microservice TCP communications.

## Features

- **API Gateway Pattern**: Single entry point (`/api`) routing client requests to backend microservices.
- **REST to TCP Proxy**: Forwards HTTP endpoints to internal microservices via NestJS `@nestjs/microservices` ClientProxy TCP transport.
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

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (HTTP API Gateway)
- **Transport**: REST (Express) to Microservices TCP ClientProxy
- **Validation**: `class-validator` & `class-transformer`
- **Error Handling**: Custom RPC Exception Filter
