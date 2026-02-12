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
If you prefer to build the image yourself:

```bash
docker build -t betterftp .
docker run -p 2121:2121 -p 7000-7010:7000-7010 betterftp
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
