# BetterFTP

BetterFTP is a modern, modular, and highly configurable FTP server written in TypeScript. It is built on top of the robust `ftp-srv` library and implements a **Clean Architecture** design, making it easy to extend, maintain, and integrate with various backend systems.

## Features

*   **Modular Authentication**: Support for multiple auth drivers out-of-the-box:
    *   **SQL**: SQLite, MySQL, PostgreSQL (via Knex).
    *   **JSON**: Simple file-based user management.
*   **Secure**:
    *   **FTPS**: Explicit TLS/SSL support for secure data transmission.
    *   **Hashing**: Bcrypt password hashing support (with extensible factory for others).
*   **Production Ready**:
    *   **Passive Mode**: Full support for NAT/Docker environments with configurable public IP.
    *   **Logging**: Structured, color-coded internal logging + Bunyan adapter for server logs.
    *   **Configurability**: Full configuration via `.env` file (strictly typed loader).
*   **Modern Stack**: Built with TypeScript, Node.js, and strictly typed interfaces.

## Docker Support

BetterFTP is fully containerized and ready for Docker environments.

### Running with Docker Compose
The easiest way to run the server is using Docker Compose. A pre-configured `docker-compose.yml` is included.

1.  **Configure environment**: The `docker-compose.yml` contains its own environment variables. You can modify them directly in the file.
2.  **Start the container**:
    ```bash
    docker-compose up -d
    ```

The server will be available on port **2121**.
- User accounts are persisted in `./users.json`.
- User data is persisted in the `./data` directory on your host machine.

### Building manually
If you prefer to build the image yourself or pull it from registry:

**Note for Private Registry:**
If this image is hosted in a private GitHub Organization registry, you must log in first:
```bash
# You need a Personal Access Token (PAT) with 'read:packages' scope
echo $YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

Then you can pull and run:

```bash
# Pull from GitHub Container Registry (replace with your org/user)
docker pull ghcr.io/tobankovichujovinky/betterftp:latest

# Run with custom ports
docker run -p 2121:2121 -p 7000-7010:7000-7010 ghcr.io/tobankovichujovinky/betterftp:latest
```

### Docker Environment Variables

The Docker image is built with **smart defaults**, so no environment variables are strictly required to start the server. However, for a production setup, you should configure these:

| Variable | Default (Docker) | Description |
| :--- | :--- | :--- |
| `PASV_URL` | `0.0.0.0` | **Important:** Set this to your public IP/Hostname if accessing from outside. |
| `PORT` | `2121` | The internal FTP command port. |
| `AUTH_DRIVER` | `json` | Defaults to `json` auth. Set to `sqlite`, `mysql`, etc. for DB. |
| `JSON_PATH` | `/app/data/users.json` | Location of the user file inside the container. |

> **Note:** If you start the container without mapped volumes or config, it will automatically generate a default admin user (`admin` / `admin123`) and print the details to the console log.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/TobankoviChujovinky/BetterFTP.git
    cd BetterFTP
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Configuration:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    *(Or just create a `.env` file based on the Configuration section below)*

## Configuration

The server is configured using a `.env` file in the root directory.

### Server Settings
| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `2121` | FTP Command port. |
| `PASV_MIN` | `7000` | Start of passive port range. |
| `PASV_MAX` | `7010` | End of passive port range. |
| `PASV_URL` | *Auto* | Public IP for clients behind NAT. |
| `MAX_CONNECTIONS` | `100` | Max concurrent connections. |
| `IDLE_TIMEOUT` | `30000` | Disconnect idle clients after X ms. |
| `GREETING` | *Default* | Server welcome message. |

### Authentication
| Variable | Description |
| :--- | :--- |
| `AUTH_DRIVER` | `sqlite` \| `mysql` \| `postgres` \| `json` |
| `AUTH_HASHING` | `bcrypt` \| `plain` |

### Database (SQL Drivers)
| Variable | Description |
| :--- | :--- |
| `DB_CONNECTION` | Path to SQLite file (e.g., `./dev.db`) or Connection String. |
| `DB_TABLE` | Name of the user table (e.g., `User`). |
| `DB_COL_USER` | Column name for username. |
| `DB_COL_PASS` | Column name for password hash. |
| `DB_COL_HOME` | Column name for home directory path. |

### Security (TLS)
To enable FTPS, set `TLS_ENABLED=true` and provide paths to your certificates.
```env
TLS_ENABLED=true
TLS_KEY_PATH=./certs/privkey.pem
TLS_CERT_PATH=./certs/fullchain.pem
```

## Running the Server

### Development
Runs the server with hot-reload using `tsx`.
```bash
npm run dev
```

### Production
Builds the TypeScript code to JavaScript (ESM) and runs it.
```bash
npm run build
npm start
```

## Architecture

The project follows **Clean Architecture** principles to separate concerns:

*   **`src/config`**: Configuration loading and validation.
*   **`src/core`**:
    *   **Domain**: Pure entities (`User.entity.ts`).
    *   **Interfaces**: Abstractions for repositories, loggers, auth providers.
    *   **Services**: Business logic (`AuthService.ts`).
    *   **BetterFtpServer**: The main server class assembling the components.
*   **`src/infrastructure`**: Concrete implementations.
    *   **Logging**: `ConsoleLogger`, `BunyanLogAdapter`.
    *   **Persistence**: `KnexUserRepository`, `JsonUserRepository`.
    *   **Security**: `BcryptHasher`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
