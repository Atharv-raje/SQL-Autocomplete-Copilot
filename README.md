## SQL Autocomplete AI — Natural Language → SQL Query Suggestions

A full-stack AI project that converts natural language questions into SQL queries, powered by LLMs, FastAPI, and Next.js + Tailwind.

This tool understands your database schema + question → returns 2–3 optimized SQL query candidates with descriptions.



## UI Preview

![SQL Autocomplete UI](./frontend/public/screenshots/UI_screenshot.png)



## 🌐 Live Demo
Step1:
Backend (Render): https://quill-sql-autocomplete.onrender.com/

⚠️ Render free tier sleeps after inactivity.
Open the backend URL once to wake it → then use the frontend normally.

Step 2 :
Frontend: [your Vercel URL]https://quill-sql-autocomplete.vercel.app/)

## Example Schema and Question 
SaaS / Subscription App

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

```
How many active users logged in during the last 7 days?
```

##  Features
✔ Natural Language → SQL Conversion

Ask questions like:

“How many users signed up last week?”

“Show the top 3 products by revenue”

“List all orders where amount > 1000”

The system generates:

Multiple SQL query suggestions

Clear human-friendly descriptions

##  Full Stack 
 Frontend:

Next.js (App Router)

Tailwind CSS

Beautiful card UI

Async loading states

Deployed on Vercel

## Backend:

FastAPI

Python

Groq Llama-3.3 model

CORS enabled

Type-checked Pydantic schemas

Deployed on Render

##  System Architecture
  ````
       User Input
            ↓
   Next.js Frontend (Vercel)
            ↓  POST /autocomplete
   FastAPI Backend (Render)
            ↓
        Groq LLM
            ↓
   SQL Suggestions JSON
            ↓
      Frontend Cards UI

````      
