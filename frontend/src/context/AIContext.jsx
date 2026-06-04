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
import {
  streamGemini,
  getMockResponse,
  mockStream,
  isGeminiAvailable,
} from "../utils/geminiClient.js";

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [activeMode, setActiveMode] = useState("motivator");
  const [conversations, setConversations] = useState(() => {
    const all = {};
    MODE_ORDER.forEach((id) => {
      all[id] = getConversationHistory(id) ?? [];
    });
    return all;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [hasGemini] = useState(() => isGeminiAvailable());

  const mockIdxRef = useRef({});
  const abortRef = useRef(null);

  const mode = PERSONALITY_MODES[activeMode];
  const messages = conversations[activeMode] ?? [];

  const makeId = () =>
    `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const addMsg = useCallback(
    (role, content, extra = {}) => {
      const msg = {
        id: makeId(),
        role,
        content,
        timestamp: new Date().toISOString(),
        mode: activeMode,
        streaming: false,
        ...extra,
      };
      setConversations((prev) => {
        const updated = {
          ...prev,
          [activeMode]: [...(prev[activeMode] ?? []), msg],
        };
        saveConversationHistory(activeMode, updated[activeMode]);
        return updated;
      });
      return msg.id;
    },
    [activeMode],
  );

  const updateMsg = useCallback(
    (id, content, done = false) => {
      setConversations((prev) => {
        const msgs = prev[activeMode] ?? [];
        const updated = msgs.map((m) =>
          m.id === id ? { ...m, content, streaming: !done } : m,
        );
        if (done) saveConversationHistory(activeMode, updated);
        return { ...prev, [activeMode]: updated };
      });
    },
    [activeMode],
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim() || isTyping) return;
      const trimmed = text.trim();
      setAiError(null);

      addMsg("user", trimmed);
      setIsTyping(true);
      extractAndSaveMemories(trimmed, "", activeMode);

      const sysPrompt = buildSystemPrompt(activeMode);
      const history = conversations[activeMode] ?? [];
      const msgs = buildMessages(activeMode, history, trimmed);
      const streamId = addMsg("assistant", "", { streaming: true });

      if (hasGemini) {
        // Real Gemini streaming
        const { ok, error } = await streamGemini({
          systemPrompt: sysPrompt,
          messages: msgs,
          onChunk: (full) => updateMsg(streamId, full, false),
        });
        if (ok) {
          updateMsg(streamId, undefined, true); // mark done (content already set)
          // Force a final read to ensure done flag is applied
          setConversations((prev) => {
            const mArr = prev[activeMode] ?? [];
            const m = mArr.find((x) => x.id === streamId);
            if (m) {
              const final = mArr.map((x) =>
                x.id === streamId ? { ...x, streaming: false } : x,
              );
              saveConversationHistory(activeMode, final);
              return { ...prev, [activeMode]: final };
            }
            return prev;
          });
        } else {
          // Gemini failed — fall back to mock for this message
          setAiError(error);
          const idx = mockIdxRef.current[activeMode] ?? 0;
          const reply = getMockResponse(activeMode, idx);
          mockIdxRef.current[activeMode] = idx + 1;
          await mockStream(reply, (full) => updateMsg(streamId, full, false));
          updateMsg(streamId, reply, true);
        }
      } else {
        // Mock streaming
        const idx = mockIdxRef.current[activeMode] ?? 0;
        const reply = getMockResponse(activeMode, idx);
        mockIdxRef.current[activeMode] = idx + 1;
        await new Promise((r) => setTimeout(r, 450 + Math.random() * 400));
        await mockStream(reply, (full) => updateMsg(streamId, full, false));
        updateMsg(streamId, reply, true);
      }

      setIsTyping(false);
    },
    [activeMode, isTyping, conversations, addMsg, updateMsg, hasGemini],
  );

  const switchMode = useCallback((id) => {
    if (PERSONALITY_MODES[id]) {
      setActiveMode(id);
      setIsTyping(false);
      setAiError(null);
    }
  }, []);

  const clearChat = useCallback(() => {
    setConversations((prev) => {
      const updated = { ...prev, [activeMode]: [] };
      saveConversationHistory(activeMode, []);
      return updated;
    });
    setIsTyping(false);
    setAiError(null);
  }, [activeMode]);

  const retryLast = useCallback(async () => {
    const msgs = conversations[activeMode] ?? [];
    const last = [...msgs].reverse().find((m) => m.role === "user");
    if (last) {
      // Remove last AI message if it's an error, then retry
      setConversations((prev) => {
        const filtered = (prev[activeMode] ?? []).filter(
          (m) => m.id !== last.id,
        );
        return { ...prev, [activeMode]: filtered };
      });
      await sendMessage(last.content);
    }
  }, [conversations, activeMode, sendMessage]);

  return (
    <AIContext.Provider
      value={{
        mode,
        activeMode,
        messages,
        isTyping,
        aiError,
        hasGemini,
        sendMessage,
        switchMode,
        clearChat,
        retryLast,
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
