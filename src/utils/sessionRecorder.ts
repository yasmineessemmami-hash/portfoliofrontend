/**
 * Session Recorder using rrweb
 *
 * Features:
 * - Batches events (5s, 200 events, or 400KB)
 * - Uses fetch with keepalive for unload
 * - Uses requestIdleCallback for non-blocking
 * - No input masking (no sensitive data on site)
 * - Sampling support (configurable)
 */

import {
  record,
  EventType,
  IncrementalSource,
} from "rrweb";
// eventWithTime is a type from rrweb, but not directly exported
// Define it based on rrweb's event structure
type eventWithTime = {
  type: EventType;
  data: any;
  timestamp: number;
};
import replayService from "../services/replay.service";
import { getCurrentKeys } from "./keys";
import { getApiBaseUrl } from "../services/api";

// Configuration
const BATCH_INTERVAL_MS = 5000; // 5 seconds
const BATCH_SIZE_EVENTS = 200;
const BATCH_SIZE_BYTES = 400 * 1024; // 400KB
const SAMPLE_RATE = 1.0; // Record 100% of sessions (change to 0.3 for 30%)

interface RecorderState {
  sessionId: string | null;
  stopRecording: (() => void) | null;
  events: eventWithTime[];
  bufferSize: number;
  lastFlushTime: number;
  flushTimer: ReturnType<typeof setTimeout> | null;
}

let recorderState: RecorderState = {
  sessionId: null,
  stopRecording: null,
  events: [],
  bufferSize: 0,
  lastFlushTime: Date.now(),
  flushTimer: null,
};

/**
 * Check if recording should be enabled
 */
function shouldRecord(): boolean {
  // Check localStorage flag
  if (typeof window !== "undefined") {
    if (localStorage.getItem("disableReplay") === "true") {
      console.log("Recording disabled: localStorage flag set");
      return false;
    }
  }

  // Check if on admin route
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/admin")) {
      console.log("Recording disabled: admin route");
      return false;
    }
  }

  // Sampling: record 30% of sessions
  const shouldSample = Math.random() < SAMPLE_RATE;
  if (!shouldSample) {
    console.log("Recording disabled: sampling (30% rate)");
  }
  return shouldSample;
}

/**
 * Calculate approximate size of events in bytes
 */
function calculateEventSize(events: any[]): number {
  try {
    return new Blob([JSON.stringify(events)]).size;
  } catch {
    // Fallback: rough estimate
    return events.length * 1000; // ~1KB per event estimate
  }
}

/**
 * Flush events to backend
 */
async function flushEvents(useBeacon: boolean = false): Promise<void> {
  if (recorderState.events.length === 0 || !recorderState.sessionId) {
    return;
  }

  const keys = getCurrentKeys();
  if (!keys) {
    console.warn("No keys available, skipping event flush");
    return;
  }

  const eventsToSend = [...recorderState.events];
  const timestamp = Date.now();

  // Clear buffer
  recorderState.events = [];
  recorderState.bufferSize = 0;
  recorderState.lastFlushTime = timestamp;

  // Send events
  // Note: sendBeacon has CORS issues with credentials, so we use fetch with keepalive instead
  if (useBeacon) {
    // Use fetch with keepalive for unload (more reliable than sendBeacon for CORS)
    try {
      // Use centralized API base URL from environment variables
      const url = `${getApiBaseUrl()}/replay/append`;

      // Use fetch with keepalive for unload (works better with CORS)
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: recorderState.sessionId,
          userKey: keys.userKey,
          appKey: keys.appKey,
          events: eventsToSend,
          ts: timestamp,
        }),
        keepalive: true, // Ensures request completes even if page unloads
      }).catch((error) => {
        console.error("Error sending events on unload:", error);
      });

      console.log(`Sent ${eventsToSend.length} events via fetch (keepalive)`);
      return; // Don't continue to normal fetch
    } catch (error) {
      console.error("Error sending events on unload:", error);
    }
  } else {
    // Use fetch with keepalive
    try {
      await replayService.appendEvents(
        recorderState.sessionId,
        keys.userKey,
        keys.appKey,
        eventsToSend,
        timestamp
      );
      console.log(`Sent ${eventsToSend.length} events via fetch`);
    } catch (error) {
      console.error("Error sending events:", error);
      // Re-add events to buffer if send failed
      recorderState.events.unshift(...eventsToSend);
      recorderState.bufferSize = calculateEventSize(recorderState.events);
    }
  }
}

/**
 * Check if buffer should be flushed
 */
function shouldFlush(): boolean {
  const timeSinceLastFlush = Date.now() - recorderState.lastFlushTime;
  const eventCount = recorderState.events.length;
  const bufferSize = recorderState.bufferSize;

  return (
    timeSinceLastFlush >= BATCH_INTERVAL_MS ||
    eventCount >= BATCH_SIZE_EVENTS ||
    bufferSize >= BATCH_SIZE_BYTES
  );
}

/**
 * Schedule flush using requestIdleCallback or setTimeout
 */
function scheduleFlush(): void {
  if (recorderState.flushTimer) {
    return; // Already scheduled
  }

  const flush = () => {
    recorderState.flushTimer = null;
    if (shouldFlush()) {
      flushEvents().catch(console.error);
    }
  };

  // Use requestIdleCallback if available, otherwise setTimeout
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(flush, { timeout: 1000 });
  } else {
    recorderState.flushTimer = setTimeout(flush, 0);
  }
}

/**
 * Start recording session
 */
export async function startRecording(
  userKey: string,
  appKey: string
): Promise<void> {
  // Check if should record
  if (!shouldRecord()) {
    console.log("Recording disabled (sampling or flag)");
    return;
  }

  // Stop any existing recording
  if (recorderState.stopRecording) {
    recorderState.stopRecording();
  }

  try {
    // Start new session
    const sessionId = await replayService.startSession(userKey, appKey);
    recorderState.sessionId = sessionId;
    recorderState.events = [];
    recorderState.bufferSize = 0;
    recorderState.lastFlushTime = Date.now();

    console.log("Session recording started:", sessionId);

    // Start rrweb recording
    const stopFn = record({
      emit(event: eventWithTime) {
        // Deep clone and sanitize the event to prevent "null" text from appearing in replay
        // This is critical because React may render null values, but rrweb captures them as "null" strings

        const sanitizeEvent = (evt: any): any => {
          if (!evt || typeof evt !== "object") return evt;

          // Deep clone to avoid mutating the original
          const sanitized = JSON.parse(JSON.stringify(evt));

          // Handle FullSnapshot (type 2) - initial DOM snapshot
          if (
            sanitized.type === EventType.FullSnapshot &&
            sanitized.data &&
            sanitized.data.node
          ) {
            const sanitizeNode = (node: any): any => {
              if (!node || typeof node !== "object") return node;

              // Sanitize text content in text nodes (type 3 = TextNode)
              if (node.type === 3) {
                if (
                  node.textContent === "null" ||
                  node.textContent === "undefined"
                ) {
                  node.textContent = "";
                } else if (typeof node.textContent === "string") {
                  // Remove "null" and "undefined" substrings
                  node.textContent = node.textContent
                    .replace(/null/g, "")
                    .replace(/undefined/g, "");
                }
              }

              // Sanitize attributes
              if (node.attributes && typeof node.attributes === "object") {
                const newAttrs: Record<string, any> = {};
                for (const [key, value] of Object.entries(node.attributes)) {
                  if (
                    value === "null" ||
                    value === "undefined" ||
                    value === null
                  ) {
                    newAttrs[key] = "";
                  } else if (typeof value === "string") {
                    // Remove "null" and "undefined" substrings
                    newAttrs[key] = value
                      .replace(/null/g, "")
                      .replace(/undefined/g, "");
                  } else {
                    newAttrs[key] = value;
                  }
                }
                node.attributes = newAttrs;
              }

              // Recursively sanitize child nodes
              if (node.childNodes && Array.isArray(node.childNodes)) {
                node.childNodes = node.childNodes.map(sanitizeNode);
              }

              return node;
            };

            sanitized.data.node = sanitizeNode(sanitized.data.node);
          }

          // Handle IncrementalSnapshot (type 3) - DOM mutations
          if (
            sanitized.type === EventType.IncrementalSnapshot &&
            sanitized.data
          ) {
            // Check for text mutations (source 0 = Mutation)
            if (sanitized.data.source === IncrementalSource.Mutation) {
              // Handle texts array
              if (sanitized.data.texts && Array.isArray(sanitized.data.texts)) {
                sanitized.data.texts = sanitized.data.texts.map(
                  (textNode: any) => {
                    if (!textNode || typeof textNode !== "object")
                      return textNode;

                    // rrweb text node format: { id: number, value: string }
                    if (textNode.value !== undefined) {
                      if (
                        textNode.value === "null" ||
                        textNode.value === "undefined"
                      ) {
                        textNode.value = "";
                      } else if (typeof textNode.value === "string") {
                        textNode.value = textNode.value
                          .replace(/null/g, "")
                          .replace(/undefined/g, "");
                      }
                    }

                    // Alternative format: { id: number, text: string }
                    if (textNode.text !== undefined) {
                      if (
                        textNode.text === "null" ||
                        textNode.text === "undefined"
                      ) {
                        textNode.text = "";
                      } else if (typeof textNode.text === "string") {
                        textNode.text = textNode.text
                          .replace(/null/g, "")
                          .replace(/undefined/g, "");
                      }
                    }

                    return textNode;
                  }
                );
              }

              // Handle attributes array
              if (
                sanitized.data.attributes &&
                Array.isArray(sanitized.data.attributes)
              ) {
                sanitized.data.attributes = sanitized.data.attributes.map(
                  (attrNode: any) => {
                    if (!attrNode || typeof attrNode !== "object")
                      return attrNode;

                    if (
                      attrNode.attributes &&
                      typeof attrNode.attributes === "object"
                    ) {
                      const newAttrs: Record<string, any> = {};
                      for (const [key, value] of Object.entries(
                        attrNode.attributes
                      )) {
                        if (
                          value === "null" ||
                          value === "undefined" ||
                          value === null
                        ) {
                          newAttrs[key] = "";
                        } else if (typeof value === "string") {
                          newAttrs[key] = value
                            .replace(/null/g, "")
                            .replace(/undefined/g, "");
                        } else {
                          newAttrs[key] = value;
                        }
                      }
                      attrNode.attributes = newAttrs;
                    }

                    return attrNode;
                  }
                );
              }
            }
          }

          return sanitized;
        };

        const sanitizedEvent = sanitizeEvent(event);
        recorderState.events.push(sanitizedEvent);
        recorderState.bufferSize += calculateEventSize([sanitizedEvent]);

        // Schedule flush if needed
        if (shouldFlush()) {
          scheduleFlush();
        }
      },
      // No masking needed - no sensitive data on site
      maskAllInputs: false,
      // Record iframes
      // maskAllInputs: true,
      // maskTextSelector: 'input[type="password"], input[type="email"], input[autocomplete*="card"]',
      recordCrossOriginIframes: false,
    });
    recorderState.stopRecording = stopFn ? (() => stopFn()) : null;

    // Set up periodic flush
    recorderState.flushTimer = setInterval(() => {
      if (shouldFlush()) {
        flushEvents().catch(console.error);
      }
    }, BATCH_INTERVAL_MS);

    // Flush on page unload
    const unloadHandler = () => {
      flushEvents(true); // Use fetch with keepalive
    };
    window.addEventListener("beforeunload", unloadHandler);

    // Store unload handler for cleanup
    (recorderState as any).unloadHandler = unloadHandler as (() => void) | null;

    // Flush on visibility change (tab switch)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && shouldFlush()) {
        flushEvents().catch(console.error);
      }
    });
  } catch (error) {
    console.error("Failed to start recording:", error);
  }
}

/**
 * Stop recording
 */
export function stopRecording(): void {
  if (recorderState.stopRecording) {
    recorderState.stopRecording();
    recorderState.stopRecording = null;
  }

  if (recorderState.flushTimer) {
    clearInterval(recorderState.flushTimer);
    recorderState.flushTimer = null;
  }

  // Remove unload handler
  if ((recorderState as any).unloadHandler) {
    window.removeEventListener(
      "beforeunload",
      (recorderState as any).unloadHandler
    );
    (recorderState as any).unloadHandler = null;
  }

  // Flush remaining events
  if (recorderState.events.length > 0 && recorderState.sessionId) {
    flushEvents(true).catch(console.error);
  }

  recorderState.sessionId = null;
  recorderState.events = [];
  recorderState.bufferSize = 0;

  // Clear session ID from localStorage
  localStorage.removeItem("replay_session_id");
}

/**
 * Get current session ID
 */
export function getCurrentSessionId(): string | null {
  return recorderState.sessionId;
}
