import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Square, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { BASE_URL } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; link: string }[];
}

const starterPrompts = [
  //'What do I know about distributed systems?',
  //'Summarise what I\'ve saved about React',
  //'What topics have I been exploring lately?',
  //'Find everything I saved about databases',
  //'Tips : Ask me anything about your saved content. I only know what you\'ve taught me. Here are some example questions to get you started:',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ message: text.trim() }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let buffer = "";
      let sources: { title: string; link: string }[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: `Error: ${data.error}`,
                };
                return updated;
              });
              break;
            }
            if (data.done) {
              sources = data.sources || [];
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  sources,
                };
                return updated;
              });
            } else if (data.chunk) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + data.chunk,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Sorry, something went wrong.",
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin p-6"
      >
        <div className="max-w-[800px] mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Brain className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ask your Brain</h2>
              <p className="text-muted-foreground mb-8 text-center">
                Ask anything about your saved content. I only know what you've
                taught me.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="text-left p-3 text-sm bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-muted-foreground"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] break-words ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"} rounded-lg p-3`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Brain
                        </span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content ||
                        (isStreaming && i === messages.length - 1 ? "..." : "")}
                    </p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">
                          Sources from your brain:
                        </p>
                        <div className="space-y-1.5">
                          {msg.sources.map((src, j) => (
                            <a
                              key={j}
                              href={src.link}
                              target="_blank"
                              rel="noopener"
                              className="flex flex-wrap items-start gap-2 text-xs text-primary hover:underline break-words max-w-full"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="break-words max-w-[calc(100%-1.25rem)]">
                                {src.title}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-[800px] mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your saved content (e.g., 'What do I know about topic X?')"
            className="resize-none bg-secondary border-border min-h-[44px] max-h-[120px]"
            rows={1}
          />
          {isStreaming ? (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => abortRef.current?.abort()}
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
