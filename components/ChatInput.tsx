"use client";

import { useState } from "react";

interface Props {
  onSubmit: (question: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={3}
        placeholder={'Describe your plan or question for the garden council… (e.g. "I want to replace part of my lawn with gravel")'}
        className="w-full px-4 py-3 pr-28 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder-stone-300 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="absolute bottom-3 right-3 px-4 py-1.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? "Listening…" : "Convene"}
      </button>
      <p className="absolute top-3 right-3 text-[10px] text-stone-300 pointer-events-none">
        {!disabled && "⌘↵"}
      </p>
    </form>
  );
}
