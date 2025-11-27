## SQL Autocomplete AI — Natural Language Autocomplete → SQL Generator

A full-stack AI system that provides real-time natural-language autocomplete and generates precise SQL queries.

Powered by:

Next.js + Tailwind (frontend)

FastAPI (backend)

Groq Llama-3.3 (ultra-fast LLM)

As the user types a question, the system surfaces real-time autocomplete suggestions to help complete their natural-language query—similar to Google Search or IDE autocomplete.

When the user submits the final question, the model generates:

one accurate SQL query

with a clean natural-language explanation

displayed in a full-width, polished card UI.

## UI Preview

![SQL Autocomplete UI](./frontend/public/screenshots/UI_screenshot.png)

##  Live Demo
Step 1 — Wake Backend (Render)

🔗 Backend API (FastAPI on Render)
https://quill-sql-autocomplete.onrender.com/

⚠️ Render free tier sleeps after inactivity.
Open this once → backend wakes → then use the frontend normally.

Step 2 — Use Frontend

🔗 Frontend (Next.js on Vercel)
https://quill-sql-autocomplete.vercel.app/

## Example Schema + Question

Schema
```
Table: accounts
Columns:
- id (bigint, PK)
- user_id (bigint)
- account_type (text)

Table: transactions
Columns:
- id (bigint, PK)
- account_id (bigint, FK to accounts.id)
- amount (numeric)
- txn_type (text) -- 'credit' or 'debit'
- created_at (timestamp)
```
Question
How many active users logged in during the last 7 days?

##  Features
✔ Natural Language → SQL Autocomplete

Ask questions like:

“How many users signed up last week?”

“Show top 3 products by revenue”

“List all orders where amount > 1000”

“What is the average profit in the last 30 days?”

Returns:

2–3 suggested SQL queries

Clear human-readable descriptions

Real-time autocomplete while typing

Click-to-copy SQL card output

##  Frontend (Next.js + Tailwind)

Next.js (App Router)

Beautiful glass-style UI

Autocomplete dropdown while typing

Async loading states

Deployed on Vercel

##  Backend (FastAPI + Groq)

FastAPI REST API

Uses Groq Llama-3.3 (very fast)

Pydantic type-safe models

CORS enabled for Vercel + localhost

Deployed on Render

##  System Architecture
```
         User Input
              ↓
   Next.js Frontend (Vercel)
              ↓   POST /autocomplete
   FastAPI Backend (Render)
              ↓
            Groq LLM
              ↓
   JSON SQL Suggestions
              ↓
       UI SQL Cards
```
## Repository Structure
```
quill-sql-autocomplete/
│
├── backend/               # FastAPI app
│   ├── main.py
│   ├── llm_client.py
│   ├── autocomplete.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env (Not committed)
│
├── frontend/              # Next.js app (Vercel)
│   ├── app/
│   ├── public/
│   │   └── screenshots/
│   │       └── UI_screenshot.png
│   └── tailwind.config.ts
│
└── README.md
```

 ## 📝 Notes for Reviewers

The project supports true autocomplete, similar to Google search and IDEs.

Suggestions appear in real time as the user types.

Final SQL query is shown in a beautiful full-width card with copy button.

Backend & frontend are fully deployed — no setup required.

## Credits

Built by Atharv Raje
For the SQL Autocomplete Challenge (Quill)
