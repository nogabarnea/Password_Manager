# Password Manager

A self-hosted password manager built as my final cyber major project (12th grade).
Full-stack web application with a Python backend, SQLite database,
and a vanilla JS/HTML/CSS frontend.

## Features

- **User accounts** – signup & login flow with SQLite-backed user storage
- **Password vault** – store, view, and delete service/username/password entries
- **Random password generator** – customizable strong password creation
- **Web UI** – served from a custom Python HTTP server on `127.0.0.1:8083`
- **Modular architecture** – server logic, crypto helpers, and frontend separated

## Architecture

Frontend (HTML/CSS/JS)
        │  fetch / JSON
        ▼
Python HTTP Server (server.py)
        │
        ├──→ crypto.py    (encryption + password generation)
        ├──→ users.db     (SQLite – accounts)
        └──→ passwords_data.json  (vault storage)

## Tech Stack

- **Backend:** Python 3 (standard library only – no external deps)
- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Storage:** SQLite (accounts) + JSON (vault)
- **Architecture:** Layered – HTTP layer, crypto layer, persistence layer

## Running it
bash
git clone https://github.com/nogabarnea/password-manager.git
cd password-manager
python server.py
Then open `http://127.0.0.1:8083` in your browser.

## What I learned
- Building an HTTP server from scratch with Python's `http.server` module
- Designing a small but real database schema for user accounts
- Separating concerns between frontend, backend, and persistence layers
- Implementing a complete signup → login → authenticated-action flow
- Why password storage is *hard* – this project taught me the difference between
  obfuscation and real cryptography, and what production systems actually need
  (bcrypt, Argon2, proper key management, parameterized queries, HTTPS)

## Roadmap
- Replace XOR obfuscation with `cryptography` library (Fernet / AES-GCM)
- Replace JSON vault with encrypted SQLite blobs
- Hash master passwords with bcrypt instead of plaintext compare
- Add HTTPS / TLS
- Token-based session auth instead of plain user_id

## License
MIT
