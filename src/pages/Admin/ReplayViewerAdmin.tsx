import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminCard, AdminButton } from "@/components/Admin";
import replayService from "@/services/replay.service";
import { ArrowLeft, Play, Pause, RotateCcw, Monitor } from "lucide-react";
import { EventType, IncrementalSource } from "rrweb";

/**
 * Sanitize events to remove "null" and "undefined" text
 */
function sanitizeEvents(events: any[]): any[] {
  return events.map((event) => {
    if (!event || typeof event !== 'object') return event;

    const sanitized = JSON.parse(JSON.stringify(event)); // Deep clone

    // Handle FullSnapshot (type 2)
    if (sanitized.type === EventType.FullSnapshot && sanitized.data?.node) {
      const sanitizeNode = (node: any): any => {
        if (!node || typeof node !== 'object') return node;

        // Text node (type 3)
        if (node.type === 3 && node.textContent) {
          if (node.textContent === 'null' || node.textContent === 'undefined') {
            node.textContent = '';
          } else if (typeof node.textContent === 'string') {
            node.textContent = node.textContent.replace(/null/g, '').replace(/undefined/g, '');
          }
        }

        // Attributes
        if (node.attributes && typeof node.attributes === 'object') {
          const newAttrs: Record<string, any> = {};
          for (const [key, value] of Object.entries(node.attributes)) {
            if (value === 'null' || value === 'undefined' || value === null) {
              newAttrs[key] = '';
            } else if (typeof value === 'string') {
              newAttrs[key] = value.replace(/null/g, '').replace(/undefined/g, '');
            } else {
              newAttrs[key] = value;
            }
          }
          node.attributes = newAttrs;
        }

        // Recursively sanitize children
        if (node.childNodes && Array.isArray(node.childNodes)) {
          node.childNodes = node.childNodes.map(sanitizeNode);
        }

        return node;
      };

      sanitized.data.node = sanitizeNode(sanitized.data.node);
    }

    // Handle IncrementalSnapshot (type 3)
    if (sanitized.type === EventType.IncrementalSnapshot && sanitized.data) {
      if (sanitized.data.source === IncrementalSource.Mutation) {
        // Text mutations
        if (sanitized.data.texts && Array.isArray(sanitized.data.texts)) {
          sanitized.data.texts = sanitized.data.texts.map((textNode: any) => {
            if (!textNode || typeof textNode !== 'object') return textNode;

            if (textNode.value !== undefined) {
              if (textNode.value === 'null' || textNode.value === 'undefined') {
                textNode.value = '';
              } else if (typeof textNode.value === 'string') {
                textNode.value = textNode.value.replace(/null/g, '').replace(/undefined/g, '');
              }
            }

            if (textNode.text !== undefined) {
              if (textNode.text === 'null' || textNode.text === 'undefined') {
                textNode.text = '';
              } else if (typeof textNode.text === 'string') {
                textNode.text = textNode.text.replace(/null/g, '').replace(/undefined/g, '');
              }
            }

            return textNode;
          });
        }

        // Attribute mutations
        if (sanitized.data.attributes && Array.isArray(sanitized.data.attributes)) {
          sanitized.data.attributes = sanitized.data.attributes.map((attrNode: any) => {
            if (!attrNode || typeof attrNode !== 'object') return attrNode;

            if (attrNode.attributes && typeof attrNode.attributes === 'object') {
              const newAttrs: Record<string, any> = {};
              for (const [key, value] of Object.entries(attrNode.attributes)) {
                if (value === 'null' || value === 'undefined' || value === null) {
                  newAttrs[key] = '';
                } else if (typeof value === 'string') {
                  newAttrs[key] = value.replace(/null/g, '').replace(/undefined/g, '');
                } else {
                  newAttrs[key] = value;
                }
              }
              attrNode.attributes = newAttrs;
            }

            return attrNode;
          });
        }
      }
    }

    return sanitized;
  });
}

export default function ReplayViewerAdmin() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayerReady, setReplayerReady] = useState(false);
  const replayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is required");
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        const data = await replayService.getSession(sessionId);
        setSession(data);
        // Sanitize events to remove "null" text before setting
        const sanitizedEvents = sanitizeEvents(data.events || []);
        setEvents(sanitizedEvents);
      } catch (err: any) {
        setError(err.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (events.length === 0 || !containerRef.current) {
      return;
    }

    // Lazy load rrweb Replayer
    const initReplayer = async () => {
      try {
        const { Replayer } = await import("rrweb");

        if (!containerRef.current) return;

        // Clear container
        containerRef.current.innerHTML = "";

        // Create a stable wrapper with fixed height
        const wrapper = document.createElement("div");
        wrapper.id = "rrweb-replayer-wrapper";
        wrapper.style.cssText = `
          position: relative;
          width: 100%;
          height: 600px;
          overflow: visible;
          background: white;
        `;
        containerRef.current.appendChild(wrapper);

        // Create replayer instance
        replayerRef.current = new Replayer(events, {
          root: wrapper,
          speed: 1,
          skipInactive: false,
          mouseTail: {
            strokeStyle: "#ff0000",
            lineWidth: 2,
            duration: 500,
          },
        });

        // Set up event listeners to track play/pause state
        const playHandler = () => setIsPlaying(true);
        const pauseHandler = () => setIsPlaying(false);

        // Listen to replayer events
        replayerRef.current.on("start", playHandler);
        replayerRef.current.on("pause", pauseHandler);
        replayerRef.current.on("finish", pauseHandler);

        // Add minimal CSS for proper positioning
        const styleId = "rrweb-replayer-styles-" + sessionId;
        let style = document.getElementById(styleId) as HTMLStyleElement;
        if (!style) {
          style = document.createElement("style");
          style.id = styleId;
          document.head.appendChild(style);
        }

        style.textContent = `
          #rrweb-replayer-wrapper iframe {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border: 0 !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #rrweb-replayer-wrapper .rr-mouse,
          #rrweb-replayer-wrapper .rr-mouse-tail,
          #rrweb-replayer-wrapper svg.rr-mouse-tail {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 20000 !important;
            pointer-events: none !important;
            overflow: visible !important;
          }
          #rrweb-replayer-wrapper svg.rr-mouse-tail path {
            stroke: red !important;
            stroke-width: 2 !important;
            opacity: 1 !important;
          }
        `;

        // Check if events contain mouse movements
        // rrweb event types: 3 = IncrementalSnapshot (includes mouse moves), 5 = Meta, 2 = FullSnapshot
        const hasMouseEvents = events.some((e: any) => {
          if (e.type === 3 && e.data) {
            // Check if it's a mouse move event
            return e.data.source === 3 || e.data.source === 5; // 3 = MouseMove, 5 = MouseInteraction
          }
          return false;
        });
        console.log("Events contain mouse movements:", hasMouseEvents, "Total events:", events.length);
        if (!hasMouseEvents) {
          console.warn("No mouse movement events found in recording. Mouse tail will not be visible.");
        }

        // Initialize replayer - render initial frame to show content
        // Mouse tail elements are created dynamically during playback
        setTimeout(() => {
          if (replayerRef.current) {
            // Play to first frame then immediately pause to render initial state
            replayerRef.current.play(0);
            replayerRef.current.pause();

            // Function to ensure mouse tail is visible
            // Only target mouse tail specific elements, not all SVGs
            let hasLogged = false;
            const ensureMouseTailVisible = () => {
              // Only check for mouse tail specific selectors
              const mouseTailSelectors = [
                "svg.rr-mouse-tail",
                ".rr-mouse-tail",
                "svg[class*='mouse-tail']",
                ".rr-mouse",
              ];

              let found = false;
              mouseTailSelectors.forEach((selector) => {
                const elements = wrapper.querySelectorAll(selector);
                elements.forEach((el) => {
                  // Skip if it's the main iframe
                  if (el.tagName === "IFRAME") return;

                  found = true;
                  const htmlEl = el as HTMLElement;

                  // Only style mouse tail elements, not content SVGs
                  if (el.classList.contains("rr-mouse-tail") ||
                    el.classList.contains("rr-mouse") ||
                    el.matches("svg.rr-mouse-tail")) {
                    htmlEl.style.cssText = `
                      position: absolute !important;
                      top: 0 !important;
                      left: 0 !important;
                      width: 100% !important;
                      height: 100% !important;
                      z-index: 20000 !important;
                      pointer-events: none !important;
                      display: block !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                      overflow: visible !important;
                    `;

                    // For SVG mouse tail elements, ensure paths are visible and red
                    if (el.tagName === "svg" && el.classList.contains("rr-mouse-tail")) {
                      const paths = el.querySelectorAll("path");
                      if (paths.length > 0) {
                        paths.forEach((path) => {
                          (path as SVGPathElement).setAttribute("stroke", "#ff0000");
                          (path as SVGPathElement).setAttribute("stroke-width", "2");
                          (path as SVGPathElement).setAttribute("opacity", "1");
                          (path as SVGPathElement).setAttribute("fill", "none");
                        });
                        if (!hasLogged) {
                          console.log(`Styled ${paths.length} paths in SVG mouse tail`);
                          hasLogged = true;
                        }
                      }
                    }
                  }
                });
              });

              // Only log once when found, or once every 10 checks if not found
              if (found && !hasLogged) {
                const mouseTail = wrapper.querySelector("svg.rr-mouse-tail");
                const mouse = wrapper.querySelector(".rr-mouse");
                console.log("Mouse tail elements found and styled:", {
                  svg: !!mouseTail,
                  mouse: !!mouse,
                });
                hasLogged = true;
              }
            };

            // Check immediately
            ensureMouseTailVisible();

            // Check periodically but less frequently to avoid spam
            let checkCount = 0;
            const checkInterval = setInterval(() => {
              checkCount++;
              ensureMouseTailVisible();
              // Stop checking after 50 attempts (10 seconds) if nothing found
              if (checkCount > 50 && !hasLogged) {
                clearInterval(checkInterval);
                console.log("Mouse tail elements not found after 10 seconds. They may be created during playback.");
              }
            }, 200);

            // Also check when replayer starts/pauses (mouse tail is created during playback)
            replayerRef.current.on("start", () => {
              hasLogged = false; // Reset log flag when playback starts
              setTimeout(ensureMouseTailVisible, 50);
            });
            replayerRef.current.on("pause", () => {
              setTimeout(ensureMouseTailVisible, 50);
            });

            // Clear interval after component unmounts
            const cleanup = () => clearInterval(checkInterval);
            (replayerRef.current as any)._cleanupMouseTail = cleanup;

            setReplayerReady(true);
            console.log("Replayer initialized with", events.length, "events");
          }
        }, 100);

      } catch (err) {
        console.error("Failed to initialize replayer:", err);
        setError("Failed to initialize replay player");
      }
    };

    initReplayer();

    return () => {
      if (replayerRef.current) {
        try {
          replayerRef.current.destroy?.();
        } catch (e) {
          console.error("Error destroying replayer:", e);
        }
        replayerRef.current = null;
        setReplayerReady(false);
      }
      // Remove style element
      const styleId = "rrweb-replayer-styles-" + sessionId;
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [events, sessionId]);

  const handlePlay = () => {
    if (replayerRef.current && replayerReady) {
      try {
        replayerRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing:", error);
      }
    }
  };

  const handlePause = () => {
    if (replayerRef.current && replayerReady) {
      try {
        replayerRef.current.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error("Error pausing:", error);
      }
    }
  };

  const handleReset = () => {
    if (replayerRef.current && replayerReady) {
      try {
        replayerRef.current.play(0);
        replayerRef.current.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error("Error resetting:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminCard>
          <div className="text-center py-8 text-muted-foreground">
            Loading session...
          </div>
        </AdminCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminCard>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <AdminButton onClick={() => navigate("/admin/replays")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </AdminButton>
          </div>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Monitor className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-['Sora']">
            Session Replay
          </h1>
          <p className="text-sm text-muted-foreground">
            Replaying session: {sessionId?.substring(0, 16)}...
          </p>
        </div>
        <AdminButton onClick={() => navigate("/admin/replays")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </AdminButton>
      </div>

      {/* Session Info */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-['Sora']">
              Session Information
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              User Key
            </label>
            <p className="mt-1">
              <code className="text-xs bg-secondary px-2 py-1 rounded font-mono break-all">
                {session?.userKey}
              </code>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              App Key
            </label>
            <p className="mt-1">
              <code className="text-xs bg-secondary px-2 py-1 rounded font-mono break-all">
                {session?.appKey}
              </code>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Created At
            </label>
            <p className="mt-1 text-foreground">
              {session?.createdAt
                ? new Date(session.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Event Count
            </label>
            <p className="mt-1 font-semibold text-foreground">
              {session?.eventCount || 0} events
            </p>
          </div>
        </div>
      </AdminCard>

      {/* Replay Controls */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-['Sora']">
              Replay Controls
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <AdminButton
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={events.length === 0 || !replayerReady}
            variant="primary"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </AdminButton>
          <AdminButton
            onClick={handleReset}
            disabled={events.length === 0 || !replayerReady}
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </AdminButton>
          {!replayerReady && events.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Initializing player...
            </span>
          )}
        </div>

        {/* Replay Container */}
        <div className="w-full border border-border rounded-lg bg-white overflow-hidden shadow-sm">
          <div
            ref={containerRef}
            className="w-full"
            style={{
              minHeight: "600px",
              backgroundColor: "#ffffff",
              position: "relative",
              overflow: "auto",
            }}
          />
        </div>
      </AdminCard>
    </div>
  );
}
