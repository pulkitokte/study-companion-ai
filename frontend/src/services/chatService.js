// Chat / AI service — conversation persistence + memory, backend-ready structure.

import {
  getConversationHistory,
  saveConversationHistory,
  extractAndSaveMemories,
} from "../utils/aiMemory.js";
import { PERSONALITY_MODES, MODE_ORDER } from "../utils/personalityModes.js";
import {
  isGeminiAvailable,
  streamGemini,
  callGemini,
  getMockResponse,
  mockStream,
} from "../utils/geminiClient.js";
import { enqueueSync } from "../lib/cloudSync.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";

export const chatService = {
  // ─── MODES ──────────────────────────────────────────────────
  getModes() {
    return PERSONALITY_MODES;
  },
  getModeOrder() {
    return MODE_ORDER;
  },

  // ─── CONVERSATION HISTORY ───────────────────────────────────
  getHistory(modeId) {
    return getConversationHistory(modeId) ?? [];
  },

  saveHistory(modeId, messages) {
    saveConversationHistory(modeId, messages);
    // Lightweight sync — only push last message to avoid huge payloads
    const last = messages[messages.length - 1];
    if (last) enqueueSync("chat_message", { modeId, message: last });
    return messages;
  },

  clearHistory(modeId) {
    saveConversationHistory(modeId, []);
    enqueueSync("chat_history_cleared", { modeId });
  },

  clearAllHistory() {
    MODE_ORDER.forEach((id) => saveConversationHistory(id, []));
    StorageAdapter.remove(NAMESPACES.chatHistory);
    enqueueSync("chat_history_cleared", { modeId: "all" });
  },

  // ─── MEMORY ─────────────────────────────────────────────────
  extractAndSaveMemories,

  getMemories() {
    return StorageAdapter.get(NAMESPACES.aiMemory, []);
  },

  // ─── AI CALLS ───────────────────────────────────────────────
  isLiveAIAvailable: isGeminiAvailable,

  async streamReply({ systemPrompt, messages, onChunk }) {
    if (isGeminiAvailable()) {
      return streamGemini({ systemPrompt, messages, onChunk });
    }
    return { ok: false, error: "no_key", fullText: "" };
  },

  async getReply({ systemPrompt, userMessage }) {
    if (isGeminiAvailable()) {
      return callGemini({ systemPrompt, userMessage });
    }
    return { ok: false, error: "no_key", text: "" };
  },

  getMockResponse,
  mockStream,
};

export default chatService;
