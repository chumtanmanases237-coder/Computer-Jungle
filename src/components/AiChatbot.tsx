/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Send, Sparkles, HelpCircle, ArrowRight, BookOpen } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "Hello! Welcome to Computer Jungle Training Center Kumba. I am your AI Academic & Diagnostics Assistant. How can I guide your tech journey or computer repairs today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (data.modelUsed) {
        setModelUsed(data.modelUsed);
      }
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "I am experiencing network delays connecting to the primary Gemini servers. Please try again, or visit our physical campus at Confidence Street Junction, Fiango, Kumba.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterQuestions = [
    { text: "What is the tuition cost for courses?", label: "Tuition Fees" },
    { text: "Which courses offer 12-month durations?", label: "12-Month courses" },
    { text: "Help me choose a course for web development", label: "Software Eng Course" },
    { text: "Give me a quick computer hardware repair quiz!", label: "Diagnostic Quiz" },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer z-50 group border border-blue-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium whitespace-nowrap text-sm">
          Chat with AI Assistant
        </span>
        <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-ping" />
      </motion.button>

      {/* Chat window drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[550px] bg-zinc-950 rounded-2xl shadow-3xl flex flex-col overflow-hidden border border-zinc-800 z-50"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-zinc-900 text-zinc-100 p-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 border border-zinc-800 p-2 rounded-xl">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Computer Jungle AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                      {modelUsed ? `Active: ${modelUsed}` : "Online & Grounded"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950"
              ref={scrollRef}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-blue-600 text-zinc-100 rounded-br-none shadow-md shadow-blue-600/10"
                        : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`text-[9px] block mt-1.5 text-right ${
                        m.sender === "user" ? "text-blue-200" : "text-zinc-500"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm rounded-bl-none max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-0" />
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-300" />
                      </div>
                      <span className="text-xs text-zinc-400 font-medium">Formulating response...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Starter Prompts */}
            {messages.length === 1 && (
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 grid grid-cols-2 gap-2">
                {starterQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.text)}
                    className="text-left text-xs bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 p-2 rounded-xl transition-all duration-200 border border-zinc-850 hover:border-blue-500/30 cursor-pointer flex items-start gap-1.5"
                  >
                    <Sparkles className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask about courses, repairs, custom ID..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 text-xs border border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 bg-zinc-950 text-zinc-100"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
