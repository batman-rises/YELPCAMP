import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Tent, Loader2 } from "lucide-react";
import api from "../../lib/api";

export default function CampBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hey! I'm CampBot, your camping companion. Ask me anything about camping, gear, trekking routes, or campgrounds across India!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Send history (excluding the initial greeting) for context
      const history = messages.slice(1);
      const { data } = await api.post("/chat", { message: text, history });
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "What to pack for camping?",
    "Best camping spots in India",
    "Camping safety tips",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lifted flex items-center justify-center transition-all duration-300 ${
          open
            ? "bg-red-500 hover:bg-red-600"
            : "bg-forest-700 hover:bg-forest-800"
        }`}
        aria-label="Open CampBot"
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-lifted border border-[#e3dfd7] flex flex-col overflow-hidden"
          style={{ maxHeight: "min(520px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-forest-800 px-4 py-3 flex items-center gap-3">
            <div className="bg-forest-600 p-1.5 rounded-lg">
              <Tent size={16} className="text-sand-300" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">CampBot</p>
              <p className="text-forest-300 text-xs">Your camping companion</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#faf8f5]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-forest-700 text-white rounded-br-sm"
                      : "bg-white text-gray-700 border border-[#e3dfd7] rounded-bl-sm shadow-card"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#e3dfd7] rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                  <Loader2 size={15} className="text-forest-500 animate-spin" />
                </div>
              </div>
            )}

            {/* Suggestions (only shown at start) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
                    className="text-xs bg-white border border-[#e3dfd7] text-forest-700 px-3 py-1.5 rounded-full hover:bg-forest-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#e3dfd7] bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about camping..."
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-[#e3dfd7] focus:outline-none focus:border-forest-400 bg-[#faf8f5]"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
