# Scholarship assistant deployment

The chatbot runs on the FastAPI service. Keep the Groq credential on the backend; do not add it to a `VITE_*` frontend variable.

## Render environment

Set these environment variables for the backend service:

- `DATABASE_URL` — Render PostgreSQL connection URL used by both the API and Alembic migrations.
- `SECRET_KEY` — a long, random secret used for authentication and reset-code hashing; replace any development default.
- `GROQ_API_KEY` — API key from Groq.
- `GROQ_MODEL` — optional; defaults to `llama-3.3-70b-versatile`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — required to deliver password-reset codes.
- `SMTP_TLS` — optional; defaults to `true`.

With the frontend and backend in this repository, configure Render with the repository root as its Root Directory and use:

```sh
# Build command
cd backend && python -m pip install -r requirements.txt

# Pre-deploy command
cd backend && alembic upgrade head

# Start command
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

Alembic reads `DATABASE_URL` from the environment. Run the migration as a pre-deploy step so existing databases receive the new columns before the updated API starts.

The chatbot stores each conversation and its messages in the database, scoped to the authenticated user. The assistant receives a maximum of 20 recent stored messages plus the current prompt. Message content is limited to 4,000 characters.

## Chat API

All routes require the existing bearer token:

- `POST /chat/conversations` — create a conversation; accepts `{"title":"..."}`.
- `GET /chat/conversations` — list the signed-in user's conversations.
- `GET /chat/conversations/{id}` — read a conversation and its messages.
- `DELETE /chat/conversations/{id}` — delete a conversation and its messages.
- `POST /chat/conversations/{id}/messages/stream` — stream a response as Server-Sent Events; accepts `{"content":"..."}`. Token events contain `{"token":"..."}`, and a final `done` event contains the conversation ID.

The chatbot endpoint returns a clear `503` response if `GROQ_API_KEY` is not configured. Password-reset responses do not disclose whether an email address is registered. Reset codes expire after 15 minutes, are stored as an HMAC digest, and can only be used once.
