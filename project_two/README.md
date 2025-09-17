# Lawrence's System

## Description

Lawrence's System is a full-stack application designed to streamline development and deployment using Docker, Laravel (back-end), and a modern front-end framework. The system is structured for scalability, maintainability, and ease of use, supporting local development and production environments.

## Project Structure

- back-end  
  - Laravel application (API, business logic, database migrations, etc.)
  - .env, `.env.default`, `.env.example` – Environment configuration files
  - `artisan` – Laravel CLI tool
  - composer.json, composer.lock – PHP dependencies
  - `Dockerfile` – Docker build instructions for the back-end
  - package.json – Node dependencies for asset compilation
  - phpunit.xml – PHPUnit configuration
  - `postcss.config.js` – PostCSS configuration
  - README.md – Back-end documentation
  - `config/` – Application configuration (e.g., scribe.php for API docs)
  - vendor – Composer dependencies
  - `...` – Other Laravel directories (app, routes, database, tests, etc.)
- front-end  
  - Front-end application source code
  - `...` – Framework-specific files and folders
- k8s  
  - Kubernetes deployment manifests
- nginx  
  - Nginx configuration for serving the application
- docker-compose.yml  
  - Main Docker Compose file
- docker-compose.backend.yml  
  - Docker Compose override for back-end services
- docker-compose.frontend.yml  
  - Docker Compose override for front-end services
- docker-compose.mysql.yml  
  - Docker Compose override for MySQL database
- docker-compose-ff.yml  
  - Additional Docker Compose configuration
- composer.json, composer.lock  
  - Project-level PHP dependencies
- package.json  
  - Project-level Node dependencies
- README.md  
  - Project documentation
- .env  
  - Root environment configuration

## Interfaces

- **API**: RESTful endpoints provided by the Laravel back-end.
- **Web UI**: Modern front-end (framework-agnostic, see front-end).
- **API Documentation**:  
  - Generated using Scribe, accessible at `/docs` when running the back-end.
  - Postman collection and OpenAPI spec available in `public/docs/`.
- **CLI**:  
  - Laravel Artisan commands (artisan)
  - Docker Compose scripts for orchestration

## Usage

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional) Node.js and Composer for local development

### Setup

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to .env in both root and back-end as needed.
   - Update values as required.

3. **Start the system using Docker Compose:**
   ```sh
   docker-compose up -d
   ```

4. **Access the application:**
   - API: `http://localhost:<backend-port>/api`
   - Front-end: `http://localhost:<frontend-port>`
   - API Docs: `http://localhost:<backend-port>/docs`

### Running Tests

- **Back-end (PHPUnit):**
  ```sh
  docker-compose exec backend vendor/bin/phpunit
  ```

### API Documentation

- Visit `/docs` endpoint for interactive API documentation.
- Postman and OpenAPI specs are available in `public/docs/`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**For more details, see the individual README.md files in the back-end and front-end directories.**