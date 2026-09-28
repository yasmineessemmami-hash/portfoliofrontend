import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initializeKeys } from "../utils/keys";
import { startRecording, stopRecording } from "../utils/sessionRecorder";

/**
 * Hook to manage session recording
 * Only records on guest pages (not admin)
 */
export function useSessionRecording() {
  const location = useLocation();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Skip recording for admin routes
    const isAdminRoute = location.pathname.startsWith("/admin");
    if (isAdminRoute) {
      // Stop recording if we're on admin route
      if (initializedRef.current) {
        stopRecording();
        initializedRef.current = false;
      }
      return;
    }

    // Initialize keys and start recording after 5 seconds delay
    const init = async () => {
      try {
        const keys = await initializeKeys();
        
        // Wait 5 seconds before starting recording
        setTimeout(async () => {
          try {
            await startRecording(keys.userKey, keys.appKey);
            initializedRef.current = true;
            console.log("Session recording started after 5 second delay");
          } catch (error) {
            console.error("Failed to start session recording:", error);
          }
        }, 5000);
      } catch (error) {
        console.error("Failed to initialize session recording:", error);
      }
    };

    // Only initialize once
    if (!initializedRef.current) {
      init();
    }

    // Don't cleanup on route change - keep session alive across pages
    // Only cleanup on unmount (component removal)
    return () => {
      // Only stop if we're actually leaving the app (not just changing routes)
      // This keeps the session alive across page navigation
    };
  }, [location.pathname]);
}

