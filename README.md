# Chat App

## Overview

The process is described as these step:

the overview from the UI side is described as this:
![frontend diagram](.readme/Frontend.png)

the overview for the Server side is described as this:
![frontend diagram](.readme/Backend.png)

## About Backend

### Developed using
- Express JS for the router
- Socket IO for the websocket server
- Mongoose for MongoDB ORM
- Pino js for logger

- esbuild for bundle into production ready and converting ESM to commonJS
- ESLint, Prettier for linting and code formatting
- Typescript for strict language
- Jest for testing


## About Frontend

### Develop using
- React and Vite for development tool
- TailwindCSS for styling
- React Hook Form for managing form state and validating form
- Zod for validation schema
- Zustand for global state management
- Socket IO Client for connecting to Backend Websocket
- Axios for HTTP Client

## Get Started

### Docker Compose

the compose file includes `Mongodb` and `Redis` container

1. Just start the services by running
```bash
docker-compose up -d
```

### Manual

#### Requirements

1. Nodejs version >= 18
2. Mongodb
3. Redis (optional)

#### Backend

1. Go to the backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Setup env variables. you will need to set the variable for `MONGO_URI` and `JWT_SECRET` for minimum setup
```
cp .env.example .env
```

4. Run development
```bash
npm run dev
```

5. Run test
```bash
npm run test
```

6. Build for production
```bash
npm run build

# start the production built by running:
npm run start
```

#### Frontend

1. Go to the web directory
```bash
# dont forget to "cd .." if you are still in backend directory

cd web
```

2. Install dependencies
```bash
npm install
```

3. Setup env variables. you will need to set the variable for `VITE_WS_URI` and `VITE_API_URL` to the backend url
```bash
cp .env .env.example
```

4. Run development
```bash
npm run dev
```

5. Build for produciton
```bash
npm run build

# the static built will be inside dist/ directory
```
