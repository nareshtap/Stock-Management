# Stock Management Project

This repository contains two main services:

1. **Backend**: `stock-management` built using NestJS.
2. **Frontend**: `stock-management-ui` built using Next.js.

Both services are containerized using Docker for seamless deployment and development.

## Deployed Url
https://stock-management-ten-alpha.vercel.app/

## Preview
![stockgif (1)](https://github.com/user-attachments/assets/a13ffc95-5b58-404e-8c25-4b066b50b4fb)


## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Environment Variables](#environment-variables)
  - [Docker Setup](#docker-setup)
- [Development Workflow](#development-workflow)
- [Build and Run](#build-and-run)
- [Project Structure](#project-structure)
- [License](#license)

---

## Prerequisites

Ensure the following tools are installed on your system:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Setup Instructions

### Environment Variables

Both the backend and frontend require environment variables to run. Follow these steps to set them up:

1. Navigate to the respective service folders:
   - Backend: `stock-management`
   - Frontend: `stock-management-ui`

2. Copy the example environment files:
   ```bash
   cp stock-management/.example.env stock-management/.env
   cp stock-management-ui/.example.env stock-management-ui/.env
   ```
3. Update the `.env` files with appropriate values.

### Docker Setup

The project uses Docker Compose for container orchestration. The `docker-compose.yml` file is located in the root directory.

#### Docker Compose Configuration

```yaml
version: '3.5'

services:
  stockmanagement:
    image: stockmanagement
    build:
      context: ./stock-management
      dockerfile: ./Dockerfile
    ports:
      - 8000:8000
    networks:
      - project_network

  stockmanagement-ui:
    build:
      context: ./stock-management-ui
      dockerfile: ./Dockerfile
    ports:
      - 3000:3000
    depends_on:
      - stockmanagement
    networks:
      - project_network

networks:
  project_network:
    driver: bridge
```

---

## Development Workflow

### Running Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Start Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the services:
   - Backend: [http://localhost:8000](http://localhost:8000)
   - Frontend: [http://localhost:3000](http://localhost:3000)

4. To stop the services:
   ```bash
   docker-compose down
   ```

---

## Build and Run

### Backend (NestJS)

1. Navigate to the backend folder:
   ```bash
   cd stock-management
   ```
2. Build and start the backend:
   ```bash
   npm install
   npm run build
   npm start
   ```

### Frontend (Next.js)

1. Navigate to the frontend folder:
   ```bash
   cd stock-management-ui
   ```
2. Build and start the frontend:
   ```bash
   npm install
   npm run build
   npm start
   ```

---

## Project Structure

```plaintext
.
├── docker-compose.yml
├── stock-management
│   ├── Dockerfile
│   ├── .example.env
│   ├── .env
│   ├── src
│   └── package.json
├── stock-management-ui
│   ├── Dockerfile
│   ├── .example.env
│   ├── .env
│   ├── pages
│   └── package.json
```

