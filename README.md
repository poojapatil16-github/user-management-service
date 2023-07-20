# Project Name

User Management Service

## Description

The User Management Service is a microservice built using Nest.js and TypeORM. It provides endpoints for user registration, login, and subscription management.


## Installation
1. Clone the repository.

```bash
git clone https://github.com/your-username/user-management-service.git
```

2. Install dependencies.

```bash
cd user-management-service
npm install
```
3. Set up the database connection by configuring the TypeORM settings in app.module.ts.

```bash
// app.module.ts

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'your-database-username',
      password: 'your-database-password',
      database: 'userManagement',
      entities: [User, Subscription, Partner, Service],
      synchronize: true,
    }),
    // Other imports...
  ],
  // Other module configurations...
})
export class AppModule {}

```

## Configuration

Ensure that you have a running MySQL database with the name userManagement and appropriate credentials. Update the TypeORM settings in app.module.ts to match your database configuration.

Please keep synchronize value in AppModule as true only for first time. This will automatically create the tables in your MySQL DB. Once tables are created please make this value as false.
This will ensure that there will not be any unnecessary updates. Otherwise typeORM behaves weird in case of synchronize parameter as true.

## Usage

Start the User Management Service.

```bash
npm run start
```
By default, the service runs on http://localhost:3001.


# Endpoints

The following endpoints are available:

1. POST /users/register: Register a new user. 

Request Body:
```bash
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "secret"
}
```

2. POST /users/login: Login and receive an access token.

Request Body:

```bash
{
  "email": "john.doe@example.com",
  "password": "secret"
}
```

3. POST /partners/register: Create Partner in the system

Request Body:

```bash
{
  "partnerName": "Partner A",
  "partnerCode": "PARTNER_A_CODE"
}
```

4. POST /services/partners/{partnerId}/services

Create services under partner by based on provider id. This API is for our purpose which will do manually. For adding partner and their services in the system.

Request Body:

```bash
{
  "serviceName": "ServiceA",
  "serviceCode": "SERVICE_A_CODE"
}
```

5. POST /subscription/subscribe: Subscribe to a service.

Below endpoints are guarded. Please provide JWT token received from login API to perform this action.

Request Body:

```bash
{
  "userId": 1, //(user id from DB will get this id from UI. UI can pass this info)
  "partnerId": 1,//(partner id from DB)
  "serviceId": 1 //(service id from DB)
}
```

6. POST /subscription/unsubscribe: Unsubscribe from a service.

Below endpoints are guarded. Please provide JWT token received from login API to perform this action.

Request Body:

```bash
{
  "userId": 1,
  "partnerId": 1,
  "serviceId": 1
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)