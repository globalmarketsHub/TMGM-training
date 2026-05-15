"use client";

import { useEffect } from "react";

const IDLE_LIMIT_MS = 5 * 60 * 1000;
const FLUSH_EVERY_SECONDS = 30;

export function TrainingTimer({ trainingDayId }: { trainingDayId: string }) {
  useEffect(() => {
    let bufferedSeconds = 0;
    let lastTick = Date.now();
    let lastActivity = Date.now();
    let focused = document.hasFocus();
    let visible = !document.hidden;
    let pointerInside = true;
    const playingVideos = new Set<HTMLMediaElement>();

    const markActivity = () => {
      lastActivity = Date.now();
      pointerInside = true;
    };

    const flush = (useBeacon = false) => {
      const seconds = Math.floor(bufferedSeconds);
      if (seconds <= 0) return;
      bufferedSeconds = 0;
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - seconds * 1000);
      const payload = {
        trainingDayId,
        seconds,
        source: playingVideos.size > 0 ? "VIDEO" : "TIMER",
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        clientMeta: {
          focused,
          visible,
          pointerInside
        }
      };

      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/training/active-time", blob);
        return;
      }

      fetch("/api/training/active-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {
        bufferedSeconds += seconds;
      });
    };

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.min(5, Math.max(0, Math.floor((now - lastTick) / 1000)));
      lastTick = now;

      const idle = now - lastActivity > IDLE_LIMIT_MS;
      const active = visible && focused && pointerInside && (!idle || playingVideos.size > 0);

      if (active) {
        bufferedSeconds += elapsed;
      }

      if (bufferedSeconds >= FLUSH_EVERY_SECONDS) {
        flush(false);
      }
    };

    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (!visible) flush(true);
    };
    const onFocus = () => {
      focused = true;
      markActivity();
    };
    const onBlur = () => {
      focused = false;
      flush(true);
    };
    const onMouseOver = () => {
      pointerInside = true;
    };
    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        pointerInside = false;
        flush(true);
      }
    };
    const onPlay = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLVideoElement) {
        playingVideos.add(target);
        markActivity();
      }
    };
    const onPause = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLVideoElement) {
        playingVideos.delete(target);
        lastActivity = Date.now();
      }
    };
    const onBeforeUnload = () => flush(true);

    const interval = window.setInterval(tick, 1000);
    const activityEvents = ["mousemove", "mousedown", "scroll", "keydown", "touchstart", "pointerdown"];

    activityEvents.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mouseout", onMouseOut);
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onPause, true);
    document.addEventListener("ended", onPause, true);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      flush(true);
      window.clearInterval(interval);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onPause, true);
      document.removeEventListener("ended", onPause, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [trainingDayId]);

  return null;
}
