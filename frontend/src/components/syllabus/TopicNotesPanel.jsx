import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import syllabusService from "../../services/syllabusService";

const MAX_NOTES_LENGTH = 3000;

export default function TopicNotesPanel({
  examId,
  subjectId,
  topicId,
  progress,
  onUpdate,
}) {
  const [notes, setNotes] = useState(progress?.notes || "");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceErrors, setResourceErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef(null);

  // Sync if progress prop changes externally
  useEffect(() => {
    setNotes(progress?.notes || "");
  }, [progress?.notes]);

  // Debounced autosave
  const handleNotesChange = useCallback(
    (e) => {
      const val = e.target.value.slice(0, MAX_NOTES_LENGTH);
      setNotes(val);
      setSaveStatus("saving");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          syllabusService.updateTopicNotes(examId, subjectId, topicId, val);
          if (onUpdate) onUpdate();
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 500);
    },
    [examId, subjectId, topicId, onUpdate]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Resource validation
  const validateResource = () => {
    const errors = {};
    if (!resourceTitle.trim()) errors.title = "Title is required.";
    if (!resourceUrl.trim()) {
      errors.url = "URL is required.";
    } else if (
      !resourceUrl.startsWith("http://") &&
      !resourceUrl.startsWith("https://")
    ) {
      errors.url = "URL must begin with http:// or https://";
    }
    return errors;
  };

  const handleAddResource = () => {
    const errors = validateResource();
    if (Object.keys(errors).length > 0) {
      setResourceErrors(errors);
      return;
    }
    setResourceErrors({});

    const resource = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: resourceTitle.trim(),
      url: resourceUrl.trim(),
    };

    try {
      syllabusService.addTopicResource(examId, subjectId, topicId, resource);
      if (onUpdate) onUpdate();
      setResourceTitle("");
      setResourceUrl("");
      setAdding(false);
    } catch {
      setResourceErrors({ general: "Failed to save resource. Try again." });
    }
  };

  const handleRemoveResource = (resourceId) => {
    try {
      syllabusService.removeTopicResource(examId, subjectId, topicId, resourceId);
      if (onUpdate) onUpdate();
    } catch {
      // silent — resource may already be removed
    }
  };

  const resources = progress?.resources || [];
  const charsLeft = MAX_NOTES_LENGTH - notes.length;

  return (
    <div className="space-y-5">
      {/* ── NOTES ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>📋</span> Personal Notes
          </h4>

          <AnimatePresence mode="wait">
            {saveStatus === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-yellow-500 dark:text-yellow-400 flex items-center gap-1"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                Saving…
              </motion.span>
            )}
            {saveStatus === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-500 dark:text-green-400 flex items-center gap-1"
              >
                <span>✓</span> Saved
              </motion.span>
            )}
            {saveStatus === "error" && (
              <motion.span
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 dark:text-red-400"
              >
                ✗ Save failed
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <textarea
          value={notes}
          onChange={handleNotesChange}
          maxLength={MAX_NOTES_LENGTH}
          rows={5}
          placeholder="Write personal notes, formulas, tricks or reminders..."
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
            resize-none transition-colors duration-150"
        />

        <div className="flex justify-end mt-1">
          <span
            className={`text-xs tabular-nums ${
              charsLeft < 50
                ? "text-red-500"
                : charsLeft < 200
                ? "text-yellow-500 dark:text-yellow-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {charsLeft} / {MAX_NOTES_LENGTH} characters remaining
          </span>
        </div>
      </div>

      {/* ── RESOURCES ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>🔗</span> Resources
          </h4>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400
                hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <span className="text-base leading-none">+</span> Add Resource
            </button>
          )}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-700
                bg-indigo-50/50 dark:bg-indigo-900/20 p-3 mb-3 space-y-2">

                {resourceErrors.general && (
                  <p className="text-xs text-red-500">{resourceErrors.general}</p>
                )}

                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => {
                      setResourceTitle(e.target.value);
                      if (resourceErrors.title)
                        setResourceErrors((p) => ({ ...p, title: undefined }));
                    }}
                    placeholder="Resource title (e.g. Laxmikanth Chapter 3)"
                    className={`w-full px-3 py-2 text-sm rounded-md border
                      bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors
                      ${resourceErrors.title
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                      }`}
                  />
                  {resourceErrors.title && (
                    <p className="text-xs text-red-500 mt-0.5">{resourceErrors.title}</p>
                  )}
                </div>

                {/* URL */}
                <div>
                  <input
                    type="url"
                    value={resourceUrl}
                    onChange={(e) => {
                      setResourceUrl(e.target.value);
                      if (resourceErrors.url)
                        setResourceErrors((p) => ({ ...p, url: undefined }));
                    }}
                    placeholder="https://youtube.com/..."
                    className={`w-full px-3 py-2 text-sm rounded-md border
                      bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors
                      ${resourceErrors.url
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                      }`}
                  />
                  {resourceErrors.url && (
                    <p className="text-xs text-red-500 mt-0.5">{resourceErrors.url}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={handleAddResource}
                    className="flex-1 py-1.5 rounded-md text-xs font-semibold
                      bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                      text-white transition-colors duration-150"
                  >
                    Save Resource
                  </button>
                  <button
                    onClick={() => {
                      setAdding(false);
                      setResourceTitle("");
                      setResourceUrl("");
                      setResourceErrors({});
                    }}
                    className="flex-1 py-1.5 rounded-md text-xs font-semibold
                      bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                      text-gray-600 dark:text-gray-300 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {resources.length === 0 && !adding && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2">
            No resources yet. Add YouTube links, PDFs or reference material.
          </p>
        )}

        {/* Resource Cards */}
        <AnimatePresence initial={false}>
          {resources.map((res) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800
                hover:border-indigo-300 dark:hover:border-indigo-600
                transition-colors duration-150"
            >
              {/* Link icon */}
              <span className="text-indigo-500 dark:text-indigo-400 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
                </svg>
              </span>

              {/* Title */}
              <span className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {res.title}
              </span>

              {/* Open in new tab */}
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                className="shrink-0 p-1 rounded text-gray-400 hover:text-indigo-600
                  dark:hover:text-indigo-400 transition-colors duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Delete */}
              <button
                onClick={() => handleRemoveResource(res.id)}
                title="Remove resource"
                className="shrink-0 p-1 rounded text-gray-300 hover:text-red-500
                  dark:text-gray-600 dark:hover:text-red-400 transition-colors duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}