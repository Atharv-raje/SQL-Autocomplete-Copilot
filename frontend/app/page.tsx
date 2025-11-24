"use client";

import { useState } from "react";

const SCHEMAS = {
  orders: `Table: orders
Columns:
- id (bigint, PK)
- user_id (bigint)
- total_amount (numeric)
- profit (numeric)
- order_date (timestamp)`,

  events: `Table: events
Description: User-generated events for analytics (page views, clicks, etc.).
Columns:
- id (bigint, PK)
- user_id (bigint, FK to users.id)
- name (text)
- properties (jsonb)
- occurred_at (timestamp)`,

  saas: `Table: users
Columns:
- id (bigint, PK)
- email (text)
- signup_date (date)
- plan (text)

Table: logins
Columns:
- id (bigint, PK)
- user_id (bigint, FK to users.id)
- login_at (timestamp)`,

  attendance: `Table: employees
Columns:
- id (bigint, PK)
- name (text)
- department (text)
- salary (numeric)

Table: attendance
Columns:
- id (bigint, PK)
- employee_id (bigint, FK to employees.id)
- attended_on (date)`
} as const;

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [schema, setSchema] = useState<string>(SCHEMAS.orders);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOptions([]);

    if (!userInput.trim() || !schema.trim()) {
      setError("Please provide both a question and a schema.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://quill-sql-autocomplete.onrender.com/autocomplete", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          schemaDescription: schema,
          conversationHistory: []
        })
      });

      if (!res.ok) {
        setError("Backend returned an error. Check server logs.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOptions(data.options || []);
    } catch {
      setError("Could not reach backend. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  const copySql = async (sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      alert("SQL copied to clipboard");
    } catch {
      alert("Could not copy SQL");
    }
  };

  const handleSchemaPresetChange = (value: string) => {
    if (value === "custom") return;
    if (value in SCHEMAS) {
      setSchema(SCHEMAS[value as keyof typeof SCHEMAS]);
    }
  };

  return (
    <div className={darkMode ? "themeDark" : "themeLight"}>
      {/* NAV */}
      <header className="nav">
        <div className="navInner">
          <div className="navLeft">
            <div className="navLogoDot" />
            <span className="navBrand">Quill SQL</span>
          </div>
          <div className="navRight">
            <span className="navTag">Prototype · Natural language → SQL</span>
            <button
              type="button"
              className="themeToggle"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {darkMode ? "🌙 Dark" : "☀︎ Light"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="page">
        <div className="container">
          <header className="header">
            <h1 className="title">Natural Language SQL Autocomplete</h1>
            <p className="subtitle">
              Ask a question in plain English and get SQL query suggestions based on your schema.
            </p>
          </header>

          {/* INPUT PANEL */}
          <section className="panel">
            <form onSubmit={submit} className="form">
              <div className="field">
                <label className="label">Your question</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Example: average profit in last 7 days"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>

              <div className="field">
                <div className="fieldHeader">
                  <label className="label">Schema description</label>
                  <select
                    className="schemaSelect"
                    defaultValue="custom"
                    onChange={(e) => handleSchemaPresetChange(e.target.value)}
                  >
                    <option value="custom">Custom schema</option>
                    <option value="orders">Orders · E-commerce</option>
                    <option value="events">Events · Analytics</option>
                    <option value="saas">Users & logins · SaaS</option>
                    <option value="attendance">Employees & attendance</option>
                  </select>
                </div>
                <textarea
                  className="input"
                  rows={8}
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="button" disabled={loading}>
                {loading ? "Generating..." : "Generate SQL suggestions"}
              </button>
            </form>
          </section>

          {/* RESULTS */}
          <section className="results">
            <div className="resultsHeaderRow">
              <h2 className="resultsTitle">Suggestions</h2>

              <div className="resultsMeta">
                <span className="resultsPill">Model: llama-3.3-70B · Groq</span>
                <span className="resultsDot" />
                <span className="resultsMetaText">Returns: up to 3 SQL options</span>
              </div>
            </div>

            {options.length === 0 && !loading && (
              <p className="empty">No suggestions yet. Submit a question to see SQL options.</p>
            )}

            <div className="resultsGrid">
              {options.map((opt, index) => (
                <div key={index} className="card">
                  <div className="cardHeader">
                    <span className="badge">Option {index + 1}</span>
                  </div>

                  <p className="cardDescription">{opt.description}</p>

                  <pre className="codeBlock">
                    <code>{opt.sqlQuery}</code>
                  </pre>

                  <button className="copyButton" onClick={() => copySql(opt.sqlQuery)}>
                    <span className="copyButtonIcon" aria-hidden="true">
                      ⧉
                    </span>
                    <span>Copy SQL</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="footer">
            <span>Built for the Quill take-home by Atharv Raje.</span>
            <span className="footerHint">
              Focused on fast autocomplete, schema-aware prompts, and multiple SQL interpretations.
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
