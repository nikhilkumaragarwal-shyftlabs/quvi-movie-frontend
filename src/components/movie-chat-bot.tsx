"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChatMovieStrip } from "@/components/chat-movie-strip";
import { api, type CatalogItem } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  items?: CatalogItem[];
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Quvi — ask me what you're in the mood for, a genre, or a specific title. I'll find picks on Netflix, HBO Max, Apple TV+, Hulu, and Peacock.",
};

const STARTERS = [
  "Something scary for tonight",
  "Feel-good comedy movies",
  "What should I binge?",
  "Recommend something for me",
];

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function MovieChatBot() {
  const { token, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, sending]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !token || sending) return;

      setError("");
      setSending(true);
      setInput("");

      const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const region = await detectRegion();
        const history = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const data = await api.chatMovies(token, {
          message: trimmed,
          history,
          region,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: data.reply,
            items: data.items,
          },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not get suggestions");
      } finally {
        setSending(false);
      }
    },
    [token, sending, messages],
  );

  const resetChat = useCallback(() => {
    if (sending) return;
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setError("");
    inputRef.current?.focus();
  }, [sending]);

  const canReset = messages.length > 1 || input.length > 0 || !!error;

  useEffect(() => {
    if (!token) setOpen(false);
  }, [token]);

  if (authLoading || !token) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open && (
          <div
            className="flex h-[min(560px,calc(100vh-6rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50 animate-fade-in"
            role="dialog"
            aria-label="Movie assistant chat"
          >
            <header className="flex items-center justify-between border-b border-border bg-elevated px-4 py-3">
              <div>
                <p className="font-display text-base font-bold text-foreground">Quvi Assistant</p>
                <p className="text-xs text-muted">Movies & TV on your services</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  disabled={!canReset || sending}
                  className="rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-background hover:text-foreground disabled:opacity-40"
                  aria-label="Reset chat"
                  title="Reset chat"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"
                  aria-label="Close chat"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white rounded-br-md"
                        : "bg-elevated text-foreground ring-1 ring-border rounded-bl-md"
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.items && msg.items.length > 0 && <ChatMovieStrip items={msg.items} />}
                    {msg.items && msg.items.length === 0 && msg.role === "assistant" && msg.id !== "welcome" && (
                      <p className="mt-2 text-xs text-muted">
                        No matches on your streaming services — try another ask.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-elevated px-4 py-3 ring-1 ring-border">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}
            </div>

            {token && !sending && messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-gold/50 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!token || sending}
                  placeholder={token ? "Ask for a mood, genre, or title…" : "Sign in to chat"}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-gold disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!token || sending || !input.trim()}
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition hover:bg-accent-hover hover:scale-105"
          aria-label={open ? "Close movie assistant" : "Open movie assistant"}
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
