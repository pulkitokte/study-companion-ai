/**
 * searchUtils.js
 *
 * Pure search utility layer for Phase 26 — Topic Search System.
 *
 * Enforced constraints:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All functions: same input → same output (unit-testable)
 *
 * Data source (passed by caller, never fetched here):
 *   SYLLABUS_DATA — default export from data/syllabusData.js
 */

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

/**
 * Normalise a string for search comparison:
 * lowercase, collapse whitespace, strip punctuation that adds noise.
 */
function _normalise(str) {
  if (typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/[()[\].,·•–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a normalised string into tokens of at least 2 characters.
 */
function _tokenise(str) {
  return _normalise(str)
    .split(" ")
    .filter((t) => t.length >= 2);
}

/**
 * Returns true when every token in the array is found somewhere
 * within the target string.
 */
function _allTokensPresent(tokens, target) {
  return tokens.every((t) => target.includes(t));
}

/**
 * Returns the count of tokens that appear as a prefix of any
 * whitespace-separated word in the target string.
 */
function _prefixMatchCount(tokens, targetWords) {
  let count = 0;
  tokens.forEach((token) => {
    if (targetWords.some((word) => word.startsWith(token))) count++;
  });
  return count;
}

/**
 * Returns the count of tokens found anywhere in the target string.
 */
function _anywhereMatchCount(tokens, target) {
  let count = 0;
  tokens.forEach((token) => {
    if (target.includes(token)) count++;
  });
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildSearchIndex
 *
 * Transforms the entire SYLLABUS_DATA object into a flat array of
 * search index entries. Should be called once on mount and memoised.
 *
 * @param  {object} syllabusData — default export from data/syllabusData.js
 * @returns {Array}  Flat index with one entry per topic across all exams.
 *                   Returns [] defensively on bad input.
 *
 * Each entry shape:
 * {
 *   topicId, subjectId, examId,
 *   topicLabel, subjectLabel, subjectEmoji, subjectColor,
 *   examLabel, examShortLabel, examEmoji, examColor,
 *   difficulty, xp,
 *   searchText   — pre-normalised, ready for matching
 * }
 */
export function buildSearchIndex(syllabusData) {
  try {
    if (!syllabusData || typeof syllabusData !== "object") return [];

    const index = [];

    Object.values(syllabusData).forEach((exam) => {
      if (!exam || typeof exam.subjects !== "object") return;

      const examMeta = {
        examId: exam.id ?? "",
        examLabel: exam.label ?? "",
        examShortLabel: exam.shortLabel ?? exam.label ?? "",
        examEmoji: exam.emoji ?? "",
        examColor: exam.color ?? "#7C6FFF",
      };

      Object.values(exam.subjects).forEach((subject) => {
        if (!subject || !Array.isArray(subject.topics)) return;

        const subjectMeta = {
          subjectId: subject.id ?? "",
          subjectLabel: subject.label ?? "",
          subjectEmoji: subject.emoji ?? "📚",
          subjectColor: subject.color ?? "#7C6FFF",
        };

        subject.topics.forEach((topic) => {
          if (!topic || !topic.id) return;

          // Pre-build the full searchable surface (lowercased, single string).
          // Order: topic label first (highest weight field) → subject → exam.
          // Additional keyword expansions can be appended here in future.
          const searchText = _normalise(
            [
              topic.label ?? "",
              subject.label ?? "",
              exam.label ?? "",
              exam.shortLabel ?? "",
              topic.difficulty ?? "",
            ].join(" "),
          );

          index.push({
            // Identity
            topicId: topic.id,
            subjectId: subjectMeta.subjectId,
            examId: examMeta.examId,

            // Display
            topicLabel: topic.label ?? "",
            subjectLabel: subjectMeta.subjectLabel,
            subjectEmoji: subjectMeta.subjectEmoji,
            subjectColor: subjectMeta.subjectColor,
            examLabel: examMeta.examLabel,
            examShortLabel: examMeta.examShortLabel,
            examEmoji: examMeta.examEmoji,
            examColor: examMeta.examColor,

            // Topic attributes
            difficulty: topic.difficulty ?? "medium",
            xp: topic.xp ?? 0,

            // Pre-computed search surface
            searchText,
          });
        });
      });
    });

    return index;
  } catch {
    return [];
  }
}

/**
 * runSearch
 *
 * Scores every entry in the search index against the query and returns
 * a sorted, deduplicated list of matching results.
 *
 * Scoring weights (from roadmap spec):
 *   Exact phrase match in topicLabel      → +100
 *   Exact phrase match in subjectLabel    → +40
 *   All tokens present in searchText      → +60
 *   Per token: prefix match in topicLabel → +30
 *   Per token: present anywhere           → +10
 *
 * @param  {string} query   — raw user input
 * @param  {Array}  index   — output of buildSearchIndex()
 * @param  {number} limit   — max results to return (default 20)
 * @returns {Array}  Entries with score appended, sorted desc, capped at limit.
 *                   Returns [] defensively on bad input or short query.
 *
 * Each result shape: { ...indexEntry, score }
 */
export function runSearch(query, index, limit = 20) {
  try {
    if (typeof query !== "string") return [];
    if (!Array.isArray(index) || index.length === 0) return [];

    const normalised = _normalise(query);
    if (normalised.length < 2) return [];

    const tokens = _tokenise(normalised);
    if (tokens.length === 0) return [];

    const seen = new Set(); // guard against duplicate topicId within same exam
    const scored = [];

    index.forEach((entry) => {
      // Deduplication key: exam + subject + topic (a topic id may repeat across exams)
      const dedupKey = `${entry.examId}::${entry.subjectId}::${entry.topicId}`;
      if (seen.has(dedupKey)) return;
      seen.add(dedupKey);

      const normTopic = _normalise(entry.topicLabel);
      const normSubject = _normalise(entry.subjectLabel);
      const topicWords = normTopic.split(" ");

      let score = 0;

      // ── Exact phrase matches ────────────────────────────────────────────
      if (normTopic.includes(normalised)) score += 100;
      if (normSubject.includes(normalised)) score += 40;

      // ── All tokens present anywhere in the full search surface ──────────
      if (_allTokensPresent(tokens, entry.searchText)) score += 60;

      // ── Per-token prefix match against words in the topic label ─────────
      score += _prefixMatchCount(tokens, topicWords) * 30;

      // ── Per-token anywhere match across full search surface ──────────────
      score += _anywhereMatchCount(tokens, entry.searchText) * 10;

      if (score > 0) {
        scored.push({ ...entry, score });
      }
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.floor(limit)));
  } catch {
    return [];
  }
}
