"use client";

import { useState, useRef, useCallback } from "react";

type QueryOption = {
  completionText: string;
  sqlQuery: string;
};

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [schema, setSchema] = useState(`Table: transactions
Columns:
- id (bigint, PK)
- account_id (bigint, FK to accounts.id)
- amount (numeric)
- txn_type (text) -- 'credit' or 'debit'
- created_at (timestamp)`);

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<QueryOption[]>([]);
  const [error, setError] = useState("");

  // inline dropdown state
  const [inlineSuggestions, setInlineSuggestions] = useState<string[]>([]);
  const [showInline, setShowInline] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://quill-sql-autocomplete.onrender.com/autocomplete";

  // ---------------- INLINE AUTOCOMPLETE (DROPDOWN) ----------------
  const fetchInlineSuggestions = useCallback(
    async (partial: string) => {
      try {
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput: partial,
            schemaDescription: schema,
            conversationHistory: [],
          }),
        });

        if (!res.ok) {
          setShowInline(false);
          return;
        }

        const data = await res.json();
        const raw: any[] = Array.isArray(data.options) ? data.options : [];

        const suggestions: string[] = raw
          .map((opt: any) =>
            String(
              opt.completionText ??
                opt.description ??
                ""
            ).trim()
          )
          .filter((s: string) => s.length > 0)
          .slice(0, 5);

        setInlineSuggestions(suggestions);
        setShowInline(suggestions.length > 0);
      } catch (err) {
        console.error("Inline autocomplete error:", err);
        setShowInline(false);
      }
    },
    [backendUrl, schema]
  );

  const handleUserInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setUserInput(value);
    setError("");

    if (!value.trim() || value.trim().length < 3) {
      setInlineSuggestions([]);
      setShowInline(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetchInlineSuggestions(value);
    }, 400);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setUserInput(suggestion);
    setShowInline(false);
    setInlineSuggestions([]);
    await submit(undefined, suggestion);
  };

  // ---------------- MAIN SUBMIT (FINAL SQL) ----------------
  const submit = async (
    e?: React.FormEvent,
    overrideQuestion?: string
  ) => {
    if (e) e.preventDefault();
    setError("");
    setOptions([]);

    const finalQuestion = (overrideQuestion ?? userInput).trim();
    if (!finalQuestion || !schema.trim()) {
      setError("Please provide both a question and a schema.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: finalQuestion,
          schemaDescription: schema,
          conversationHistory: [],
        }),
      });

      if (!res.ok) {
        setError("Backend returned an error. Check server logs.");
        return;
      }

      const data = await res.json();
      const sqlOptions: any[] = Array.isArray(data.options)
        ? data.options
        : [];

      const normalized: QueryOption[] = sqlOptions
        .map((opt: any) => ({
          completionText: String(
            opt.completionText ??
              opt.description ??
              ""
          ),
          sqlQuery: String(
            opt.sqlQuery ?? opt.sql_query ?? opt.sql ?? ""
          ),
        }))
        .filter((o: QueryOption) => o.completionText && o.sqlQuery);

      // show ONLY the top option as the final SQL
      setOptions(normalized.slice(0, 1));
    } catch (err) {
      console.error(err);
      setError(
        "Could not reach backend. Make sure the Render service is awake."
      );
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
            Start typing a question in plain English and get real-time
            autocomplete suggestions, plus a ready-to-run SQL query.
          </p>
        </header>

        <section className="panel">
          <form onSubmit={submit} className="form">
            {/* Question + dropdown */}
            <div className="field">
              <label className="label">Your partially typed question</label>
              <div className="autocompleteWrapper">
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Example: total amount of all debit transactions..."
                  value={userInput}
                  onChange={handleUserInputChange}
                />
                {showInline && inlineSuggestions.length > 0 && (
                  <ul className="suggestionList">
                    {inlineSuggestions.map((s, idx) => (
                      <li
                        key={idx}
                        className="suggestionItem"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Schema */}
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
              {loading
                ? "Generating..."
                : "Generate autocomplete suggestions"}
            </button>
          </form>
        </section>

        <section className="results">
          <h2 className="resultsTitle">SQL suggestion</h2>
          {options.length === 0 && !loading && (
            <p className="empty">
              No SQL yet. Type a question, pick an autocomplete suggestion,
              or press the button to generate one.
            </p>
          )}
          <div className="resultsGrid">
            {options.map((opt, index) => (
              <div key={index} className="card">
                <div className="cardHeader">
                  <span className="badge">Option {index + 1}</span>
                </div>
                <p className="cardDescription">{opt.completionText}</p>
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
