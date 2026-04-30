# Password Manager

A self-hosted password manager built as my final cyber major project (12th grade).
Full-stack web application with a Python backend, SQLite database,
and a vanilla JS/HTML/CSS frontend.

## Features

- **User accounts** – signup & login with SQLite-backed storage, salted SHA-256 hashing
- **Brute-force protection** – login lockout after 3 failed attempts (60 second cooldown)
- **Password vault** – store, view, and delete service/username/password entries per user
- **Encrypted storage** – saved passwords are XOR-encrypted before being written to disk
- **HTTPS / TLS** – all client-server communication is encrypted via a self-signed TLS certificate
- **Random password generator** – strong 12-character passwords with mixed charset
- **Auto-backup** – vault file is backed up every 60 seconds by a background thread
- **Web UI** – served from a custom Python HTTPS server on `https://127.0.0.1:8082`

## Security

| Threat | Defense |
|---|---|
| Password sniffing / MITM | TLS — all traffic is encrypted |
| Weak stored passwords | Salted SHA-256 hashing (unique salt per user) |
| Brute-force login | Lockout after 3 attempts, 60-second cooldown |
| SQL injection | Parameterized queries throughout |
| XSS | `escapeHTML()` on all user-supplied content before rendering |
| Vault data at rest | XOR encryption before writing to `passwords_data.json` |

## Architecture

```
Frontend (HTML/CSS/JS)
        │  fetch / JSON  (HTTPS)
        ▼
Python HTTPS Server (server.py)  ←  TLS via ssl.SSLContext
        │
        ├──→ crypto.py           (XOR encryption + password generation)
        ├──→ users.db            (SQLite – accounts, hashed passwords)
        └──→ passwords_data.json (vault – XOR-encrypted entries)
```

## Tech Stack

- **Backend:** Python 3 (standard library only – `http.server`, `ssl`, `sqlite3`, `threading`)
- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Storage:** SQLite (user accounts) + JSON (password vault)
- **Security:** TLS, SHA-256 + salt, XOR cipher, parameterized queries, XSS escaping

## Running it

```bash
git clone https://github.com/nogabarnea/Cyber-main.git
cd Cyber-main

# Generate TLS certificate (first time only)
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "//CN=localhost"

python server.py
```

Then open `https://127.0.0.1:8082` in your browser.
Accept the self-signed certificate warning (Advanced → Proceed).

## What I learned
- Building an HTTP/HTTPS server from scratch with Python's `http.server` and `ssl` modules
- Why TLS matters — without it, every password typed into a login form is readable on the network
- Designing a real database schema with salted password hashing
- Separating concerns between frontend, backend, crypto, and persistence layers
- Implementing a complete signup → login → authenticated-action flow
- The difference between obfuscation (XOR) and real cryptography, and what production systems need

## Roadmap
- Replace XOR vault encryption with `cryptography` library (Fernet / AES-GCM)
- Replace JSON vault with encrypted SQLite blobs
- Token-based session auth instead of plain `user_id` in sessionStorage
