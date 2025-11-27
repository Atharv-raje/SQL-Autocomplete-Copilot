"use client";

import { useState } from "react";

type QueryOption = {
  completion: string;
  sqlQuery: string;
};

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [schema, setSchema] = useState(
    `Table: orders
Columns:
- id (bigint, PK)
- user_id (bigint)
- total_amount (numeric)
- profit (numeric)
- order_date (timestamp)`
  );
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<QueryOption[]>([]);
  const [error, setError] = useState("");

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
        headers: {
          "Content-Type": "application/json"
        },
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

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <h1 className="title">Natural Language SQL Autocomplete</h1>
          <p className="subtitle">
            Start typing a question in plain English and see autocomplete suggestions with matching SQL queries,
            based on your schema.
          </p>
        </header>

        <section className="panel">
          <form onSubmit={submit} className="form">
            <div className="field">
              <label className="label">Your partially typed question</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Example: total profit in the last"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Schema description</label>
              <textarea
                className="input"
                rows={8}
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="button" disabled={loading}>
              {loading ? "Generating..." : "Generate autocomplete suggestions"}
            </button>
          </form>
        </section>

        <section className="results">
          <h2 className="resultsTitle">Autocomplete Suggestions</h2>
          {options.length === 0 && !loading && (
            <p className="empty">
              No suggestions yet. Start typing a question and submit to see autocomplete completions and SQL queries.
            </p>
          )}
          <div className="resultsGrid">
            {options.map((opt, index) => (
              <div key={index} className="card">
                <div className="cardHeader">
                  <span className="badge">Option {index + 1}</span>
                </div>
                <p className="cardDescription">{opt.completion}</p>
                <pre className="codeBlock">
                  <code>{opt.sqlQuery}</code>
                </pre>
                <button
                  type="button"
                  className="copyButton"
                  onClick={() => copySql(opt.sqlQuery)}
                >
                  Copy SQL
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
