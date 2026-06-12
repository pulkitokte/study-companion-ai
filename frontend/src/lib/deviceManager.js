import StorageAdapter from "./storageAdapter.js";

const DEVICES_NS = "devices";
const CURRENT_NS = "current_device";

// ─── DEVICE FINGERPRINT ───────────────────────────────────────────
function generateDeviceId() {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function detectDeviceInfo() {
  const ua = navigator.userAgent;
  let type = "desktop";
  if (/Mobi|Android/i.test(ua)) type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) type = "tablet";

  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Edge/i.test(ua)) browser = "Edge";

  return { type, os, browser };
}

// ─── CURRENT DEVICE ────────────────────────────────────────────────
export function getCurrentDevice() {
  let current = StorageAdapter.get(CURRENT_NS);
  if (!current) {
    const info = detectDeviceInfo();
    current = {
      id: generateDeviceId(),
      ...info,
      label: `${info.browser} on ${info.os}`,
      trusted: true,
      createdAt: new Date().toISOString(),
    };
    StorageAdapter.set(CURRENT_NS, current);
    registerDevice(current);
  }
  return current;
}

// ─── DEVICE REGISTRY ────────────────────────────────────────────────
export function getDevices() {
  return StorageAdapter.get(DEVICES_NS, []);
}

export function registerDevice(device) {
  const devices = getDevices();
  const existing = devices.find((d) => d.id === device.id);
  const updated = existing
    ? devices.map((d) =>
        d.id === device.id ? { ...d, lastActive: new Date().toISOString() } : d,
      )
    : [...devices, { ...device, lastActive: new Date().toISOString() }];
  StorageAdapter.set(DEVICES_NS, updated);
  return updated;
}

export function touchCurrentDevice() {
  const current = getCurrentDevice();
  registerDevice({ ...current, lastActive: new Date().toISOString() });
}

export function trustDevice(id, trusted = true) {
  const devices = getDevices().map((d) =>
    d.id === id ? { ...d, trusted } : d,
  );
  StorageAdapter.set(DEVICES_NS, devices);
  return devices;
}

export function removeDevice(id) {
  const devices = getDevices().filter((d) => d.id !== id);
  StorageAdapter.set(DEVICES_NS, devices);
  return devices;
}

// ─── SIMULATED MULTI-DEVICE (for demo/preview) ─────────────────────
const SIMULATED_DEVICES = [
  {
    type: "mobile",
    os: "iOS",
    browser: "Safari",
    label: "iPhone 15 Pro · Safari",
  },
  { type: "tablet", os: "iOS", browser: "Safari", label: "iPad Air · Safari" },
  {
    type: "desktop",
    os: "Windows",
    browser: "Edge",
    label: "Windows PC · Edge",
  },
];

export function getSimulatedDevices() {
  const now = Date.now();
  return SIMULATED_DEVICES.map((d, i) => ({
    id: `sim-${i}`,
    ...d,
    trusted: true,
    simulated: true,
    lastActive: new Date(
      now - (i + 1) * 1000 * 60 * (15 * (i + 1)),
    ).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * (7 + i)).toISOString(),
  }));
}

// ─── COMBINED VIEW ──────────────────────────────────────────────────
export function getAllDevices(includeSimulated = true) {
  const real = getDevices();
  touchCurrentDevice();
  const fresh = getDevices();
  return includeSimulated ? [...fresh, ...getSimulatedDevices()] : fresh;
}

export function getDeviceStats() {
  const devices = getAllDevices();
  return {
    total: devices.length,
    trusted: devices.filter((d) => d.trusted).length,
    active: devices.filter((d) => {
      const last = new Date(d.lastActive).getTime();
      return Date.now() - last < 30 * 60 * 1000; // active within 30 min
    }).length,
  };
}
