"use client";

import { useState } from "react";

interface Props {
  onSave: (key: string) => void;
}

export default function ApiKeyGate({ onSave }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("Key should start with sk-ant-");
      return;
    }
    localStorage.setItem("sc_api_key", trimmed);
    onSave(trimmed);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-semibold text-stone-800">Schrebergarten Council</h1>
          <p className="text-stone-500 mt-2 text-sm leading-relaxed">
            A garden council where non-human and human voices weigh in on your plans.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-1">Anthropic API Key</h2>
          <p className="text-xs text-stone-400 mb-4">
            Your key is stored only in this browser. API calls go directly from your browser to Anthropic — no server involved.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm font-mono text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
            >
              Enter the Council
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          Get a key at{" "}
          <span className="font-mono">console.anthropic.com</span>
        </p>
      </div>
    </div>
  );
}
