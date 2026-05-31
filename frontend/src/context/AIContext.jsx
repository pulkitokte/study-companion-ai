import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { PERSONALITY_MODES, MODE_ORDER } from "../utils/personalityModes.js";
import {
  getConversationHistory,
  saveConversationHistory,
  extractAndSaveMemories,
} from "../utils/aiMemory.js";
import {
  buildSystemPrompt,
  buildMessages,
  SUGGESTED_PROMPTS,
} from "../utils/promptBuilder.js";

// ─── MOCK RESPONSES (used when no API key is present) ──────────────
const MOCK_RESPONSES = {
  motivator: [
    "Every topper you admire started exactly where you are. The only difference? They didn't quit. Your exam is won in sessions like this one. Close the distractions. Open the book. NOW. ⚡",
    "Stop waiting to feel ready. Readiness is built through action. One chapter. One hour. Start the timer. The version of you that clears this exam begins in the next 60 seconds. 🔥",
    "Your competition doesn't care how you feel today. They're studying anyway. That's the gap — between those who feel like it and those who do it regardless. Which side are you on? 💪",
  ],
  chill: [
    "Hey, no stress okay? You're doing better than you think. Let's take it one topic at a time. What do you want to work on today? I'm right here with you. 😊",
    "Burnout is real and it's okay to feel this way. Take a breath. Maybe start with something lighter — current affairs or a quick revision. Every little bit adds up. 🌿",
    "You know what nobody tells you? Off days are completely normal. The trick is not letting one bad day become two. What's one small thing we can do right now? ✨",
  ],
  strict: [
    "That level of effort is unacceptable. A serious aspirant would already know this from daily revision. Three hours remain. Open the NCERT. No phone. No excuses. Start now.",
    "Feelings are irrelevant to this process. Your competition doesn't care about your mood. Consistent preparation is the minimum requirement. Are you meeting it or making excuses?",
    "Close every distraction. Set a 90-minute timer. Open Polity Chapter 4. Do not emerge until it rings. Report back with what you've covered. That's the only acceptable response.",
  ],
  roast: [
    "Oh wow, asking about study techniques after spending 4 hours on reels. Truly elite time management. I'm sure the UPSC board will be impressed by your watch history. 😂",
    "Three days without studying and now you want motivation? At this rate you'll clear UPSC sometime around 2047. Maybe aim for 2048? Very strategic. 🔥",
    "Your study plan is inspirational. '10 hours a day' on paper, 45 minutes in reality, then a 3-hour nap. Netflix-worthy dedication. Meanwhile, maybe open a book? 💀",
  ],
  interviewer: [
    "Very well. Let us begin. You've expressed interest in the administrative services. Tell me — what specific failure of governance convinced you that IAS was the solution, not merely an aspiration?",
    "Interesting. However, you haven't addressed the constitutional dimension. Article 356 — when is Presidential Rule justified, and what safeguards prevent its misuse? Think carefully.",
    "Let me push back. You said 'holistic development' — that phrase appears in 90% of answers. Define it precisely with a measurable indicator for a village of 500 people.",
  ],
};

function getMockResponse(modeId, index) {
  const pool = MOCK_RESPONSES[modeId] ?? MOCK_RESPONSES.motivator;
  return pool[index % pool.length];
}

// ─── CONTEXT ───────────────────────────────────────────────────────
const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [activeMode, setActiveMode] = useState("motivator");
  const [conversations, setConversations] = useState(() => {
    // Hydrate from localStorage
    const all = {};
    MODE_ORDER.forEach((id) => {
      all[id] = getConversationHistory(id) ?? [];
    });
    return all;
  });
  const [isTyping, setIsTyping] = useState(false);

  const mockIndexRef = useRef({}); // round-robin mock responses per mode

  const mode = PERSONALITY_MODES[activeMode];
  const messages = conversations[activeMode] ?? [];

  // Add a message to the active mode's conversation
  const addMessage = useCallback(
    (role, content, streaming = false) => {
      const msg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role,
        content,
        timestamp: new Date().toISOString(),
        mode: activeMode,
        streaming,
      };
      setConversations((prev) => {
        const updated = {
          ...prev,
          [activeMode]: [...(prev[activeMode] ?? []), msg],
        };
        // Persist
        saveConversationHistory(activeMode, updated[activeMode]);
        return updated;
      });
      return msg.id;
    },
    [activeMode],
  );

  // Update a streaming message's content
  const updateStreamingMessage = useCallback(
    (msgId, content, done = false) => {
      setConversations((prev) => {
        const msgs = prev[activeMode] ?? [];
        const updated = msgs.map((m) =>
          m.id === msgId ? { ...m, content, streaming: !done } : m,
        );
        if (done) saveConversationHistory(activeMode, updated);
        return { ...prev, [activeMode]: updated };
      });
    },
    [activeMode],
  );

  // Send a message — tries Gemini API, falls back to mock
  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim() || isTyping) return;
      const trimmed = text.trim();

      // Add user message
      addMessage("user", trimmed);
      setIsTyping(true);

      // Build prompt context
      const systemPrompt = buildSystemPrompt(activeMode);
      const history = conversations[activeMode] ?? [];
      const geminiMessages = buildMessages(activeMode, history, trimmed);

      // Extract memories from user message
      extractAndSaveMemories(trimmed, "", activeMode);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (apiKey) {
        // Real Gemini API call with streaming
        try {
          const streamMsgId = addMessage("assistant", "", true);

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: geminiMessages,
                generationConfig: {
                  temperature: 0.85,
                  maxOutputTokens: 600,
                  topP: 0.95,
                },
              }),
            },
          );

          if (!res.ok) throw new Error(`Gemini API error ${res.status}`);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let full = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Parse SSE lines
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const part =
                  parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                if (part) {
                  full += part;
                  updateStreamingMessage(streamMsgId, full, false);
                }
              } catch {
                /* skip malformed JSON */
              }
            }
          }

          updateStreamingMessage(streamMsgId, full || "...", true);
          setIsTyping(false);
          return;
        } catch (err) {
          console.warn("Gemini API failed, using mock:", err.message);
          // Fall through to mock
        }
      }

      // Mock response (no API key or API failure)
      const idx = mockIndexRef.current[activeMode] ?? 0;
      const reply = getMockResponse(activeMode, idx);
      mockIndexRef.current[activeMode] = idx + 1;

      const delay = 700 + Math.random() * 600;
      setTimeout(() => {
        setIsTyping(false);
        // Simulate word-by-word streaming
        const words = reply.split(" ");
        const streamId = addMessage("assistant", "", true);
        let wi = 0;

        const interval = setInterval(() => {
          wi++;
          const partial = words.slice(0, wi).join(" ");
          const done = wi >= words.length;
          updateStreamingMessage(streamId, partial, done);
          if (done) clearInterval(interval);
        }, 36);
      }, delay);
    },
    [activeMode, isTyping, conversations, addMessage, updateStreamingMessage],
  );

  // Switch mode — preserves history
  const switchMode = useCallback((modeId) => {
    if (PERSONALITY_MODES[modeId]) {
      setActiveMode(modeId);
      setIsTyping(false);
    }
  }, []);

  // Clear current mode's conversation
  const clearChat = useCallback(() => {
    setConversations((prev) => {
      const updated = { ...prev, [activeMode]: [] };
      saveConversationHistory(activeMode, []);
      return updated;
    });
    setIsTyping(false);
  }, [activeMode]);

  return (
    <AIContext.Provider
      value={{
        mode,
        activeMode,
        messages,
        isTyping,
        sendMessage,
        switchMode,
        clearChat,
        MODES: PERSONALITY_MODES,
        SUGGESTED_PROMPTS,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used inside AIProvider");
  return ctx;
}
