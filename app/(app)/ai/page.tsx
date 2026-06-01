"use client";

import { useEffect, useState } from "react";
import { executeAiFlow } from "@/features/ai/actions";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  Send,
  Bot,
  User,
  ArrowRight,
  ListTodo,
  FileText,
  MessageSquare,
  Coins,
} from "lucide-react";

interface TaskItem {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
}

interface StructuredOutput {
  category: string;
  items: TaskItem[];
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function AiPlaygroundPage() {
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<
    "summarize" | "generateJson" | "chat"
  >("summarize");

  // Input fields
  const [textToSummarize, setTextToSummarize] = useState("");
  const [roadmapPrompt, setRoadmapPrompt] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  // Outputs
  const [summaryResult, setSummaryResult] = useState<{
    summary: string;
    wordCount: number;
  } | null>(null);
  const [roadmapResult, setRoadmapResult] = useState<StructuredOutput | null>(
    null,
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // States
  const [loading, setLoading] = useState(false);
  const [currentCost, setCurrentCost] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveOrgId(localStorage.getItem("active_org_id"));
    const interval = setInterval(() => {
      const current = localStorage.getItem("active_org_id");
      if (current !== activeOrgId) {
        setActiveOrgId(current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrgId]);

  const handleRunSummarizer = async () => {
    if (!activeOrgId || !textToSummarize.trim()) return;
    setLoading(true);
    setSummaryResult(null);
    setCurrentCost(null);
    try {
      const res = await executeAiFlow(activeOrgId, "summarize", {
        text: textToSummarize,
      });
      const result = res as { summary: string; wordCount: number };
      setSummaryResult(result);
      // Compute client-side tokens and cost mock matching server logging for transparency
      const cost =
        (textToSummarize.length / 4) * 0.000000075 +
        (result.summary.length / 4) * 0.0000003;
      setCurrentCost(cost);
      toast.success("Text summarized successfully!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to execute summarizer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRunRoadmap = async () => {
    if (!activeOrgId || !roadmapPrompt.trim()) return;
    setLoading(true);
    setRoadmapResult(null);
    setCurrentCost(null);
    try {
      const res = await executeAiFlow(activeOrgId, "generateJson", {
        prompt: roadmapPrompt,
      });
      const result = res as StructuredOutput;
      setRoadmapResult(result);
      const cost =
        (roadmapPrompt.length / 4) * 0.000000075 +
        (JSON.stringify(result).length / 4) * 0.0000003;
      setCurrentCost(cost);
      toast.success("Structured roadmap generated!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate roadmap.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!activeOrgId || !chatMessage.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setLoading(true);
    setCurrentCost(null);

    try {
      const res = await executeAiFlow(activeOrgId, "chat", {
        message: userMsg.content,
        history: chatHistory,
      });

      const result = res as { reply: string };
      const modelMsg: ChatMessage = { role: "model", content: result.reply };
      setChatHistory((prev) => [...prev, modelMsg]);
      const cost =
        (userMsg.content.length / 4) * 0.000000075 +
        (result.reply.length / 4) * 0.0000003;
      setCurrentCost(cost);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Chat reply failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeOrgId) {
    return (
      <div className="border border-dashed border-border rounded-lg p-16 text-center space-y-4 bg-card shadow-sm">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground italic">
          Select or create a workspace to access the AI Playground.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="border-b border-border/60 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">AI Playground</h1>
        <p className="text-sm text-muted-foreground">
          Interact with pre-configured Firebase Genkit flows powered by Gemini.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border border-border bg-card p-1 rounded-md max-w-md">
        <button
          onClick={() => setSelectedFlow("summarize")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
            selectedFlow === "summarize"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Summarizer</span>
        </button>
        <button
          onClick={() => setSelectedFlow("generateJson")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
            selectedFlow === "generateJson"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          <span>Structured JSON</span>
        </button>
        <button
          onClick={() => setSelectedFlow("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
            selectedFlow === "chat"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Assistant Chat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4 flex-1">
            <h3 className="text-base font-bold text-foreground capitalize">
              Configure{" "}
              {selectedFlow === "generateJson"
                ? "JSON Generator"
                : selectedFlow}{" "}
              Input
            </h3>

            {/* Summarizer Input */}
            {selectedFlow === "summarize" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Text to Summarize
                </label>
                <textarea
                  value={textToSummarize}
                  onChange={(e) => setTextToSummarize(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[220px]"
                  placeholder="Paste long articles or document logs here to extract core insights..."
                />
              </div>
            )}

            {/* JSON Generator Input */}
            {selectedFlow === "generateJson" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prompt for Tasks/Roadmap
                </label>
                <textarea
                  value={roadmapPrompt}
                  onChange={(e) => setRoadmapPrompt(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[220px]"
                  placeholder="e.g. Plan a marketing launch for a developer analytics API..."
                />
              </div>
            )}

            {/* Chat Assistant input description */}
            {selectedFlow === "chat" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start a conversation with the FireSaaS AI Assistant. Explain
                  your SaaS ideas and ask questions about Firebase integration
                  options.
                </p>
                <div className="border border-border/60 bg-muted/20 p-4 rounded-md space-y-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    Suggested topics:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>How do I query multi-tenant documents securely?</li>
                    <li>Explain Firestore composite indexes.</li>
                    <li>Suggest a backup strategy for Firebase Storage.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (Not for chat since chat has its own input send button) */}
          {selectedFlow !== "chat" && (
            <div className="pt-6 border-t border-border/40 mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Coins className="h-4 w-4 text-primary" />
                <span>Estimated cost: ~ $0.002 / run</span>
              </div>
              <button
                onClick={
                  selectedFlow === "summarize"
                    ? handleRunSummarizer
                    : handleRunRoadmap
                }
                disabled={
                  loading ||
                  (selectedFlow === "summarize"
                    ? !textToSummarize.trim()
                    : !roadmapPrompt.trim())
                }
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-10 px-6 text-sm transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing Flow...
                  </>
                ) : (
                  <>
                    <span>Run AI Flow</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-6 flex flex-col justify-between min-h-[380px] shadow-sm">
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">
                AI Output Console
              </h3>
              {currentCost !== null && (
                <span className="text-xxs font-mono text-emerald-500 font-bold border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                  Cost: ${currentCost.toFixed(6)}
                </span>
              )}
            </div>

            {/* Output contents */}
            <div className="flex-1 overflow-y-auto max-h-[360px] space-y-4 mt-2">
              {/* Loader */}
              {loading && selectedFlow !== "chat" && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs">Orchestrating Genkit flow...</p>
                </div>
              )}

              {/* Summarize Output */}
              {selectedFlow === "summarize" && summaryResult && (
                <div className="space-y-4">
                  <div className="prose prose-sm text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {summaryResult.summary}
                  </div>
                  <div className="text-xxs text-muted-foreground border-t border-border/40 pt-3">
                    Words count: {summaryResult.wordCount} words
                  </div>
                </div>
              )}

              {/* JSON Roadmap Output */}
              {selectedFlow === "generateJson" && roadmapResult && (
                <div className="space-y-5">
                  <div>
                    <span className="inline-block text-xs font-semibold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full">
                      Category: {roadmapResult.category}
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {roadmapResult.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-border/80 p-4 rounded-md space-y-2 bg-muted/10"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-foreground">
                            {item.name}
                          </p>
                          <div className="flex gap-2">
                            <span
                              className={`text-xxs px-2 py-0.5 rounded-md font-bold uppercase border ${
                                item.priority === "high"
                                  ? "border-red-500/20 bg-red-500/5 text-red-500"
                                  : item.priority === "medium"
                                    ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                                    : "border-slate-500/20 bg-slate-500/5 text-muted-foreground"
                              }`}
                            >
                              {item.priority}
                            </span>
                            <span className="text-xxs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
                              {item.estimatedHours}h
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Interface */}
              {selectedFlow === "chat" && (
                <div className="flex flex-col h-[320px] justify-between">
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4">
                    {chatHistory.map((msg, idx) => {
                      const isModel = msg.role === "model";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 text-sm ${isModel ? "justify-start" : "justify-end"}`}
                        >
                          {isModel && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                              <Bot className="h-4 w-4" />
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-lg max-w-[80%] leading-relaxed ${
                              isModel
                                ? "bg-muted text-foreground rounded-tl-none"
                                : "bg-primary text-primary-foreground rounded-tr-none font-medium"
                            }`}
                          >
                            {msg.content}
                          </div>
                          {!isModel && (
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {loading && (
                      <div className="flex gap-3 text-sm justify-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                          <Bot className="h-4 w-4 animate-bounce" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg rounded-tl-none text-muted-foreground italic text-xs">
                          Thinking...
                        </div>
                      </div>
                    )}
                    {chatHistory.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground italic text-xs">
                        No messages yet. Send a message to start chatting!
                      </div>
                    )}
                  </div>

                  {/* Message Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex gap-2 border-t border-border/40 pt-4"
                  >
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={loading}
                      placeholder="Type a message to assistant..."
                      className="block flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading || !chatMessage.trim()}
                      className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 transition-colors shrink-0 disabled:opacity-50 shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Initial Empty States */}
              {!loading && !summaryResult && selectedFlow === "summarize" && (
                <p className="text-center py-16 text-xs text-muted-foreground italic">
                  Run the flow on the left to display text summaries.
                </p>
              )}

              {!loading &&
                !roadmapResult &&
                selectedFlow === "generateJson" && (
                  <p className="text-center py-16 text-xs text-muted-foreground italic">
                    Run the flow on the left to generate structured JSON.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
