"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { Bot, Send, Trash2, X } from "lucide-react";

type ChatPanelProps = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  onSend: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
  onRetry: () => void;
};

const SUGGESTIONS = [
  "Show me your bestsellers",
  "Shipping & delivery",
  "Warranty & returns",
  "How do I track my order?",
] as const;

function getMessageText(message: UIMessage): string {
  if (!Array.isArray(message.parts)) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("")
    .trim();
}

const isBusy = (status: ChatPanelProps["status"]) =>
  status === "submitted" || status === "streaming";

const ChatPanel = ({
  messages,
  status,
  onSend,
  onClear,
  onClose,
  onRetry,
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = isBusy(status);
  const botCount = messages.filter((m) => m.role === "assistant").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    onSend(text);
  };

  return (
    <div
      className="fixed bottom-24 left-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 sm:left-6 sm:bottom-24"
      style={{ width: "min(24rem, calc(100vw - 2rem))", height: "min(34rem, calc(100svh - 8rem))" }}
      role="dialog"
      aria-label="Live chat assistant"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            Compulink Assistant
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-green-500" />
            {busy ? "Typing…" : "Online"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear conversation"
          title="Clear conversation"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Trash2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          title="Close chat"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-start justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              Hi! I&apos;m the Compulink assistant. Ask me about products,
              pricing, shipping, warranty, or how to place an order. Pick a
              topic below or type your question.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSend(suggestion)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const text = getMessageText(message);
              if (!text) return null;
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
            {botCount === 0 && busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <span className="flex-1">Something went wrong. Please try again.</span>
          <button
            type="button"
            onClick={onRetry}
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-3"
      >
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            aria-label="Type your message"
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;