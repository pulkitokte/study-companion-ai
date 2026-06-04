// Viewport and touch helpers for the mobile experience

export function isMobile() {
  return window.innerWidth < 768;
}
export function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}
export function isDesktop() {
  return window.innerWidth >= 1024;
}

// Returns breakpoint string
export function getBreakpoint() {
  const w = window.innerWidth;
  if (w < 640) return "xs";
  if (w < 768) return "sm";
  if (w < 1024) return "md";
  if (w < 1280) return "lg";
  return "xl";
}

// Reduce animation complexity on low-end or mobile devices
export function getAnimationConfig() {
  const mobile = isMobile();
  return {
    stagger: mobile ? 0.04 : 0.08,
    duration: mobile ? 0.22 : 0.35,
    springStiff: mobile ? 400 : 260,
    springDamp: mobile ? 30 : 22,
    blur: mobile ? false : true,
  };
}

// Clamp values for responsive sizing
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Safe area inset helpers (for notched phones)
export function getSafeAreaBottom() {
  const el = document.documentElement;
  return parseInt(getComputedStyle(el).getPropertyValue("--sab") ?? "0") || 0;
}

// Detect touch device
export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Prevent double-tap zoom on interactive elements
export function preventDoubleTapZoom(el) {
  if (!el) return;
  let last = 0;
  el.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    },
    { passive: false },
  );
}

// Haptic feedback (if supported)
export function haptic(style = "light") {
  try {
    if ("vibrate" in navigator) {
      const patterns = { light: [10], medium: [20], heavy: [30, 10, 30] };
      navigator.vibrate(patterns[style] ?? [10]);
    }
  } catch {
    /* ignore */
  }
}
