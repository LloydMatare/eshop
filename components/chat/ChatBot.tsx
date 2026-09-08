"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [lastSeenBotCount, setLastSeenBotCount] = useState(0);

  const { messages, status, sendMessage, clearError, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const botCount = messages.filter((m) => m.role === "assistant").length;

  const toggle = () => {
    setLastSeenBotCount(botCount);
    setOpen((v) => !v);
  };

  const close = () => {
    setLastSeenBotCount(botCount);
    setOpen(false);
  };

  const handleClear = () => {
    setMessages([]);
    setLastSeenBotCount(0);
  };

  const unread = !open && botCount > lastSeenBotCount;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open live chat"}
        title="Live chat"
        className="fixed bottom-5 left-5 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {unread && (
          <span
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-background"
            aria-label="New reply"
          />
        )}
      </button>

      {open && (
        <ChatPanel
          messages={messages}
          status={status}
          onSend={(text) => sendMessage({ text })}
          onClear={handleClear}
          onClose={close}
          onRetry={clearError}
        />
      )}
    </>
  );
};

export default ChatBot;