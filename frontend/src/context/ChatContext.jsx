import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

// ─── MODE DEFINITIONS ──────────────────────────────────────────────
export const MODES = {
  motivator: {
    id: "motivator",
    name: "Motivator",
    emoji: "⚡",
    tagline: "No excuses. Only results.",
    color: "#00FFC8",
    gradient: "linear-gradient(135deg, #00FFC8, #00A884)",
    bg: "rgba(0,255,200,0.06)",
    border: "rgba(0,255,200,0.2)",
    description: "High energy. Pure discipline. Gets you off the floor.",
    avatarBg: "linear-gradient(135deg, #00FFC8, #007A5E)",
  },
  chill: {
    id: "chill",
    name: "Chill Friend",
    emoji: "😌",
    tagline: "Take it easy. We've got this.",
    color: "#7C6FFF",
    gradient: "linear-gradient(135deg, #7C6FFF, #4A3FCC)",
    bg: "rgba(124,111,255,0.06)",
    border: "rgba(124,111,255,0.2)",
    description: "Supportive, calm, and always in your corner.",
    avatarBg: "linear-gradient(135deg, #7C6FFF, #4A3FCC)",
  },
  strict: {
    id: "strict",
    name: "Strict Mentor",
    emoji: "🎯",
    tagline: "Excellence is non-negotiable.",
    color: "#FF6B2B",
    gradient: "linear-gradient(135deg, #FF6B2B, #CC3D00)",
    bg: "rgba(255,107,43,0.06)",
    border: "rgba(255,107,43,0.2)",
    description: "Harsh accountability. Zero tolerance for excuses.",
    avatarBg: "linear-gradient(135deg, #FF6B2B, #991F00)",
  },
  roast: {
    id: "roast",
    name: "Roast Mode",
    emoji: "🔥",
    tagline: "Get roasted. Get motivated.",
    color: "#FF6B9D",
    gradient: "linear-gradient(135deg, #FF6B9D, #CC2266)",
    bg: "rgba(255,107,157,0.06)",
    border: "rgba(255,107,157,0.2)",
    description: "Savage sarcasm wrapped in genuine motivation.",
    avatarBg: "linear-gradient(135deg, #FF6B9D, #991144)",
  },
  interviewer: {
    id: "interviewer",
    name: "Interviewer",
    emoji: "🏛️",
    tagline: "The board is watching.",
    color: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700, #CC9900)",
    bg: "rgba(255,215,0,0.06)",
    border: "rgba(255,215,0,0.2)",
    description: "UPSC interview simulation. Pressure. Precision.",
    avatarBg: "linear-gradient(135deg, #FFD700, #996600)",
  },
};

// ─── MOCK RESPONSES ────────────────────────────────────────────────
const MOCK_RESPONSES = {
  motivator: [
    "Listen — every topper you admire sat exactly where you are right now. The ONLY difference? They refused to quit. You have the time. You have the material. The only missing ingredient is decision. So make it. NOW. ⚡",
    "Stop waiting to feel ready. Readiness is built through action, not through more preparation. Open that chapter. Start that timer. The version of you that clears this exam begins in the next 60 seconds. 🔥",
    "You think UPSC is hard? It's hard for everyone. That's the entire point. Your job isn't to find it easy — your job is to keep moving when it's hard. Today's pain is tomorrow's rank. Keep going. 💪",
    "Every minute you're not studying, someone equally tired, equally average, equally doubting — is studying anyway. That person is taking your seat. Is that acceptable to you? ⚡",
    "Your brain is capable of far more than you believe. Memory, analysis, retention — all of it compounds with consistent effort. Stop underestimating yourself and start the next chapter. 🚀",
    "Discipline is not motivation that never runs out. Discipline is showing up even when motivation is completely gone. That's what separates the selected from the rejected. Show up today. 🎯",
  ],
  chill: [
    "Hey, no stress okay? Preparation is genuinely a long game and you're doing better than you think. Let's just take it one topic at a time. What do you feel like working on today? 😊",
    "Honestly? Burnout is real and it's completely okay to feel overwhelmed sometimes. Take a breath. Maybe start with 20 minutes of something lighter — current affairs, a podcast — and ease back in. You've got this. 🌿",
    "You know what nobody tells you about UPSC prep? Off days are totally normal. The trick is just not letting one bad day turn into two. So let's start small. One tiny thing today. What can we do? ✨",
    "I get it — motivation isn't always there. But habits stick around even when motivation disappears. Let's build something sustainable rather than burning bright and crashing. Slow and steady genuinely wins this one. 💙",
    "Remember why you actually started. Not the pressure or the competition — the real reason you want this. Hold onto that feeling today. It's a lighter session, and that's completely fine. 🌸",
    "You're not behind. Everyone feels behind. The ones who clear it are just the ones who kept going anyway despite that feeling. You're still here, still trying. That counts for a lot. 🫂",
  ],
  strict: [
    "That level of effort is not acceptable. A serious aspirant wouldn't be asking this — they would already know it from their revision. Three hours remain before your planned sleep. Open the NCERT. No phone. Start now.",
    "Feelings are completely irrelevant to this process. Your competition does not care how you feel today. 800 days of consistent preparation is the minimum baseline. Are you meeting that baseline or manufacturing excuses?",
    "You have wasted time today. Every unproductive hour in this phase has a direct cost on your result. Close every distraction. Open Polity Chapter 4. Set a timer for 90 minutes. Do not emerge until it rings.",
    "Average effort produces average results. You are not here for average. You want IAS — then stop preparing like someone who will settle for less. Read faster. Retain better. Review daily. No exceptions.",
    "This question is answered in the standard NCERT material. Before consulting your mentor, exhaust your primary sources first. That is the habit of toppers. Go back to the text. Come back when you have tried.",
    "Consistency is not something you feel like doing. It is something you schedule and execute regardless of mood. What is on your schedule for tonight? Execute that. Then we talk.",
  ],
  roast: [
    "Wow, asking about study strategies at 11pm after spending the afternoon watching reels. Truly elite time management. I'm sure the UPSC board will be very impressed by your Instagram activity. 😂",
    "Three days without studying and now you want a 'light session.' Sure. At this rate you'll finish the syllabus in time for UPSC 2031. Very strategic long-term thinking. Respect. 🔥",
    "Your study plan is genuinely inspirational. '10 hours a day' on paper, 45 minutes in reality, followed by a 3-hour nap. Netflix-worthy dedication. Someone should document this. 💀",
    "Struggling with Economy again? No worries. It's only about 25% of Prelims. Totally a minor subject. I'm sure vibing your way through will work out great. Absolutely solid strategy. 😅",
    "You postponed studying 'until tomorrow' four times this week. At this point 'tomorrow' is working harder than you are. Maybe ask tomorrow for tips? It clearly has better discipline. 🤣",
    "Oh interesting — you opened the book, read half a page, then came to chat with me. That is one approach. Questionable, but an approach. The book will still be there when you're done procrastinating. 😏",
  ],
  interviewer: [
    "Very well. Let us begin. You have expressed interest in the administrative services. Tell me — what specific, observable failure of governance in your own district convinced you that IAS was the solution, rather than merely an aspiration for status?",
    "Interesting. However, you have not addressed the constitutional dimension at all. Article 356 — under what precise circumstances is Presidential Rule constitutionally justified, and what safeguards exist to prevent its political misuse? Think carefully.",
    "You identify climate change as a challenge. The board receives hundreds of aspirants who can identify problems. What I want to know is — what is your specific, implementable solution for a district-level officer working with a severely limited budget?",
    "I will push back on that answer. You used the phrase 'holistic development' — that phrase appears in the majority of answers we hear. Define it precisely. Give me one measurable indicator of holistic development for a village of 500 people.",
    "Let us do a rapid round. India's official position on the Russia-Ukraine conflict, and the strategic reasoning behind that position. You have 45 seconds. Do not recite headlines — analyse the position.",
    "Your answer demonstrates textbook knowledge. The board is not looking for textbooks. We need to understand how you think under pressure. So tell me — if you were the Collector and two communities in your district were on the edge of violence, what is your first call?",
  ],
};

// ─── SUGGESTED PROMPTS ─────────────────────────────────────────────
export const SUGGESTED_PROMPTS = {
  motivator: [
    "I'm feeling lazy today. Push me hard.",
    "I have 6 months left. What should I do?",
    "Tell me something that'll make me study right now.",
    "I keep failing mock tests. Help me.",
  ],
  chill: [
    "I'm really burnt out. What do I do?",
    "Can we just talk about my preparation?",
    "I'm anxious about the exam. Help me calm down.",
    "What's a light topic to start with today?",
  ],
  strict: [
    "Review my study schedule strictly.",
    "I've been inconsistent. Hold me accountable.",
    "What should I have finished this week?",
    "Give me a strict 7-day recovery plan.",
  ],
  roast: [
    "Roast my study habits honestly.",
    "I haven't studied properly in 3 days.",
    "I keep choosing Netflix over books.",
    "Make me feel bad enough to actually study.",
  ],
  interviewer: [
    "Start my UPSC mock interview.",
    "Test me on current affairs this week.",
    "Ask me tough questions on Indian Polity.",
    "Give me a difficult ethical dilemma question.",
  ],
};

// ─── LOAD / SAVE CONVERSATIONS FROM LOCALSTORAGE ───────────────────
const STORAGE_KEY = "studymind_chat_history";

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Re-hydrate timestamps from strings back to Date objects
    Object.keys(parsed).forEach((modeId) => {
      parsed[modeId] = parsed[modeId].map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    });
    return parsed;
  } catch {
    return {};
  }
}

function saveConversations(convs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}

// ─── CONTEXT ───────────────────────────────────────────────────────
const ChatContext = createContext(null);

// ─── PROVIDER ──────────────────────────────────────────────────────
export function ChatProvider({ children }) {
  const [activeMode, setActiveMode] = useState("motivator");
  const [conversations, setConversations] = useState(loadConversations);
  const [isTyping, setIsTyping] = useState(false);
  const responseIndexRef = useRef({});

  const mode = MODES[activeMode];
  const messages = conversations[activeMode] ?? [];

  // Persist to localStorage whenever conversations change
  const updateConversations = useCallback((updater) => {
    setConversations((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveConversations(next);
      return next;
    });
  }, []);

  // Append a single message to current mode
  const addMessage = useCallback(
    (role, content) => {
      const newMsg = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role,
        content,
        timestamp: new Date(),
        mode: activeMode,
        streaming: false,
      };
      updateConversations((prev) => ({
        ...prev,
        [activeMode]: [...(prev[activeMode] ?? []), newMsg],
      }));
      return newMsg.id;
    },
    [activeMode, updateConversations],
  );

  // Simulate streaming response word by word
  const streamResponse = useCallback(
    (text, currentMode) => {
      const words = text.split(" ");
      const msgId = `${Date.now()}-stream-${Math.random().toString(36).slice(2)}`;
      let wordIdx = 0;

      // Insert empty streaming message
      updateConversations((prev) => ({
        ...prev,
        [currentMode]: [
          ...(prev[currentMode] ?? []),
          {
            id: msgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            mode: currentMode,
            streaming: true,
          },
        ],
      }));

      const interval = setInterval(() => {
        wordIdx++;
        const partial = words.slice(0, wordIdx).join(" ");
        const isDone = wordIdx >= words.length;

        updateConversations((prev) => {
          const msgs = prev[currentMode] ?? [];
          const updated = msgs.map((m) =>
            m.id === msgId ? { ...m, content: partial, streaming: !isDone } : m,
          );
          return { ...prev, [currentMode]: updated };
        });

        if (isDone) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 36);
    },
    [updateConversations],
  );

  // Public: send a user message
  const sendMessage = useCallback(
    (text) => {
      const trimmed = text?.trim();
      if (!trimmed || isTyping) return;

      const currentMode = activeMode;

      // Add user message immediately
      addMessage("user", trimmed);
      setIsTyping(true);

      // Pick mock response round-robin
      const pool = MOCK_RESPONSES[currentMode] ?? MOCK_RESPONSES.motivator;
      const idx = responseIndexRef.current[currentMode] ?? 0;
      const reply = pool[idx % pool.length];
      responseIndexRef.current[currentMode] = idx + 1;

      // Simulate thinking delay
      const delay = 750 + Math.random() * 650;
      setTimeout(() => {
        setIsTyping(false);
        streamResponse(reply, currentMode);
      }, delay);
    },
    [activeMode, isTyping, addMessage, streamResponse],
  );

  // Public: switch mode (preserves each mode's history)
  const switchMode = useCallback((modeId) => {
    if (!MODES[modeId]) return;
    setIsTyping(false);
    setActiveMode(modeId);
  }, []);

  // Public: clear current mode's conversation
  const clearChat = useCallback(() => {
    setIsTyping(false);
    updateConversations((prev) => ({ ...prev, [activeMode]: [] }));
  }, [activeMode, updateConversations]);

  const value = {
    mode,
    activeMode,
    messages,
    isTyping,
    sendMessage,
    switchMode,
    clearChat,
    MODES,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// ─── HOOK ──────────────────────────────────────────────────────────
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
