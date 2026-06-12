import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import realtimeEngine, {
  connect,
  disconnect,
  attemptReconnect,
  send,
  on,
  getEngineStatus,
} from "../lib/realtimeEngine.js";
import {
  getAllDevices,
  getDeviceStats,
  getCurrentDevice,
} from "../lib/deviceManager.js";
import { getPresenceSummary, setPresence } from "../lib/presenceSystem.js";
import { getRooms, ensureDemoRoom } from "../lib/collaborationManager.js";
import { getTeam, getLeaderboard } from "../lib/teamWorkspace.js";
import { getLiveSession } from "../lib/liveSessionManager.js";

const RealtimeContext = createContext(null);

const MAX_EVENTS = 30;

export function RealtimeProvider({ children }) {
  const [engineStatus, setEngineStatus] = useState(() => getEngineStatus());
  const [devices, setDevices] = useState(() => getAllDevices());
  const [presence, setPresenceState] = useState(() => getPresenceSummary());
  const [rooms, setRooms] = useState(() => getRooms());
  const [team, setTeam] = useState(() => getTeam());
  const [liveSession, setLiveSession] = useState(() => getLiveSession());
  const [eventLog, setEventLog] = useState([]);

  // Push an event onto the live feed
  const pushEvent = useCallback((type, label, meta = {}) => {
    setEventLog((prev) =>
      [
        {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type,
          label,
          meta,
          ts: Date.now(),
        },
        ...prev,
      ].slice(0, MAX_EVENTS),
    );
  }, []);

  // Init connection on mount
  useEffect(() => {
    connect();
    setPresence("online", "idle");

    const offConnecting = on("connecting", () => {
      setEngineStatus(getEngineStatus());
      pushEvent("system", "Connecting to realtime engine…");
    });
    const offConnected = on("connected", () => {
      setEngineStatus(getEngineStatus());
      pushEvent("system", "Connected — realtime engine online");
    });
    const offDisconnected = on("disconnected", () => {
      setEngineStatus(getEngineStatus());
      pushEvent("system", "Disconnected from realtime engine");
    });
    const offReconnecting = on("reconnecting", (d) => {
      setEngineStatus(getEngineStatus());
      pushEvent("system", `Reconnecting (attempt ${d.attempt}/${d.max})…`);
    });
    const offHeartbeat = on("heartbeat", () =>
      setEngineStatus(getEngineStatus()),
    );

    return () => {
      offConnecting();
      offConnected();
      offDisconnected();
      offReconnecting();
      offHeartbeat();
      setPresence("offline");
    };
  }, [pushEvent]);

  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(getAllDevices());
      setPresenceState(getPresenceSummary());
      setTeam(getTeam());
      setLiveSession(getLiveSession());
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ─── ACTIONS ────────────────────────────────────────────────────
  const refreshAll = useCallback(() => {
    setDevices(getAllDevices());
    setPresenceState(getPresenceSummary());
    setRooms(getRooms());
    setTeam(getTeam());
    setLiveSession(getLiveSession());
  }, []);

  const broadcastActivity = useCallback(
    (activity) => {
      setPresence("online", activity);
      setPresenceState(getPresenceSummary());
      send("presence_update", { activity, deviceId: getCurrentDevice().id });
      pushEvent("presence", `You switched to ${activity}`, { activity });
    },
    [pushEvent],
  );

  const initRoom = useCallback(() => {
    const room = ensureDemoRoom();
    setRooms(getRooms());
    pushEvent("room", `Joined room "${room.name}"`, { roomId: room.id });
    return room;
  }, [pushEvent]);

  const reconnectNow = useCallback(() => {
    disconnect();
    setTimeout(() => attemptReconnect(), 300);
  }, []);

  const leaderboard = useMemo(() => getLeaderboard(), [team]);
  const deviceStats = useMemo(() => getDeviceStats(), [devices]);

  const value = useMemo(
    () => ({
      engineStatus,
      devices,
      deviceStats,
      presence,
      rooms,
      team,
      leaderboard,
      liveSession,
      eventLog,
      pushEvent,
      refreshAll,
      broadcastActivity,
      initRoom,
      reconnectNow,
    }),
    [
      engineStatus,
      devices,
      deviceStats,
      presence,
      rooms,
      team,
      leaderboard,
      liveSession,
      eventLog,
      pushEvent,
      refreshAll,
      broadcastActivity,
      initRoom,
      reconnectNow,
    ],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext() {
  const ctx = useContext(RealtimeContext);
  if (!ctx)
    throw new Error("useRealtimeContext must be used inside RealtimeProvider");
  return ctx;
}
