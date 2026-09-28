import { useEffect, useMemo, useState, useRef } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Wrench, Clock, Coffee } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import SocialIcons from "@/components/social-icons/SocialIcons";
import { useCommonContext } from "@/context/CommonContext";

const MaintenanceContent = () => {
  const navigate = useNavigate();
  const { common } = useCommonContext();
  const estimated = common?.site?.estimated_date
    ? new Date(common.site.estimated_date)
    : null;
  const estimatedTime = common?.site?.estimated_time ?? null;
  const maintenanceUntil = common?.site?.maintenance_until ?? null;

  const parsedTime = useMemo(() => {
    // If we have a maintenance_until timestamp, calculate seconds until then
    if (maintenanceUntil) {
      const until = new Date(maintenanceUntil);
      const now = new Date();
      const totalSeconds = Math.max(0, Math.floor((until.getTime() - now.getTime()) / 1000));
      
      if (totalSeconds > 0) {
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          totalSeconds,
        };
      }
    }

    // Fallback to estimatedTime string parsing
    if (!estimatedTime) return null;

    const [hoursStr, minutesStr] = estimatedTime.split(":");
    const hours = Number.parseInt(hoursStr || "0", 10);
    const minutes = Number.parseInt(minutesStr || "0", 10);

    if (!Number.isFinite(hours) && !Number.isFinite(minutes)) {
      return null;
    }

    const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 0;
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
    const totalSeconds = safeHours * 3600 + safeMinutes * 60;

    if (totalSeconds <= 0) return null;

    return {
      hours: safeHours,
      minutes: safeMinutes,
      totalSeconds,
    };
  }, [estimatedTime]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    parsedTime?.totalSeconds ?? null
  );
  const startTimeRef = useRef<number | null>(null);
  const initialSecondsRef = useRef<number | null>(parsedTime?.totalSeconds ?? null);

  // Update refs when parsedTime changes (no setState to avoid cascading renders)
  useEffect(() => {
    if (parsedTime?.totalSeconds) {
      initialSecondsRef.current = parsedTime.totalSeconds;
      startTimeRef.current = Date.now();
    }
  }, [parsedTime?.totalSeconds]);

  // Initialize state when parsedTime is available (deferred to avoid synchronous setState)
  useEffect(() => {
    if (parsedTime?.totalSeconds) {
      // Use requestAnimationFrame to defer state update
      const rafId = requestAnimationFrame(() => {
        setRemainingSeconds(parsedTime.totalSeconds);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [parsedTime?.totalSeconds]);

  useEffect(() => {
    if (!parsedTime?.totalSeconds || !initialSecondsRef.current || !startTimeRef.current) {
      return;
    }

    const initialTotalSeconds = initialSecondsRef.current;
    const start = startTimeRef.current;

    const intervalId = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(initialTotalSeconds - elapsedSeconds, 0);

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        window.clearInterval(intervalId);
        navigate("/");
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [parsedTime?.totalSeconds, navigate]);

  const estimatedDurationText = useMemo(() => {
    if (!parsedTime) return null;

    const parts: string[] = [];
    if (parsedTime.hours > 0) {
      parts.push(`${parsedTime.hours} hour${parsedTime.hours === 1 ? "" : "s"}`);
    }
    if (parsedTime.minutes > 0) {
      parts.push(
        `${parsedTime.minutes} minute${parsedTime.minutes === 1 ? "" : "s"}`
      );
    }

    if (parts.length === 0) return null;
    return parts.join(" ");
  }, [parsedTime]);

  const progress =
    parsedTime?.totalSeconds && remainingSeconds != null
      ? Math.min(
        1,
        Math.max(
          0,
          (parsedTime.totalSeconds - remainingSeconds) / parsedTime.totalSeconds
        )
      )
      : null;

  const progressStyle: CSSProperties | undefined =
    progress !== null
      ? ({
        "--progress-width": `${progress * 100}%`,
      } as CSSProperties)
      : undefined;

  const formatRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes}m`);
    }
    parts.push(`${secs}s`);

    return parts.join(" ");
  };

  return (
    <section className="relative flex items-center justify-center p-4 overflow-hidden min-h-[calc(100vh-5rem)]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-hero-primary" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-hero-accent" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-soft" />

      <div className="relative z-10 max-w-2xl w-full">
        {/* Terminal Window */}
        <div className="glass rounded-2xl overflow-hidden border border-primary/30">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-primary/30">
            <div className=" flex gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-warning/50" />
              <div className="w-3 h-3 rounded-full bg-warning/30" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-primary font-mono">
                🔧 maintenance_mode.sh
              </span>
            </div>
            <Terminal className="w-4 h-4 text-primary" />
          </div>

          {/* Terminal Content */}
          <div className="p-6 sm:p-8 font-mono">
            {/* Status Script */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-2">
                <span className="text-warning">#!/bin/bash</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-primary">echo</span>{" "}
                  <span className="text-success">
                    &quot;🚧 Site under maintenance...&quot;
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-primary">npm run</span>{" "}
                  <span className="text-accent">deploy:improvements</span>
                </div>
                <div className="text-sm">
                  <span className="text-primary">status</span>=
                  <span className="text-warning">
                    &quot;in_progress&quot;
                  </span>
                </div>
              </div>
            </div>

            {/* Icon & Message */}
            <div className="text-center my-b">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="relative">
                  <Wrench className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                  <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning/75 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-warning" />
                    </span>
                  </div>
                </div>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground mb-2">
                Under <span className="text-primary">Maintenance</span>
              </h1>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">
                <span className="text-warning">// </span>
                We&apos;re making some improvements. Be right back!
              </p>
              {estimated && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Estimated back by{" "}
                  <time dateTime={estimated.toISOString()}>
                    {estimated.toLocaleString()}
                  </time>
                </p>
              )}
            </div>

            {/* Progress Simulation */}
            <div className="bg-background/50 rounded-lg p-4 mb-6 border border-border/30">
              <div className="flex items-center gap-3 mb-3">
                <Coffee className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-foreground">
                  Currently deploying updates...
                </span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span> Database migrations
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span> Security patches
                  applied
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-warning/75 animate-pulse">⟳</span>{" "}
                  Building production assets...
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/50">○</span> Final
                  deployment
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full progress-bar-variable transition-[width] duration-500"
                    style={progressStyle}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {remainingSeconds !== null && parsedTime
                    ? `Time remaining: ${formatRemaining(remainingSeconds)}`
                    : estimatedDurationText
                      ? `Estimated: ${estimatedDurationText}`
                      : estimated
                        ? `Estimated: ${estimated.toLocaleString()}`
                        : "Working hard behind the scenes..."}
                </p>
              </div>
            </div>

            {/* Stay Updated */}
            <div className="bg-surface-hover/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Want to know when we&apos;re back?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Follow my social channels for real-time updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links from backend */}
            {common?.social_links && common.social_links.length > 0 && (
              <SocialIcons socialLinks={common.social_links} className="bg-transparent py-0" />
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6 font-mono">
          <span className="text-primary">$</span> while [ &quot;$status&quot;
          != &quot;live&quot; ]; do sleep 60; done &amp;&amp; echo &quot;🚀
          We&apos;re back!&quot;
        </p>
      </div>
    </section>
  );
};

const Maintenance = () => {
  return (
    <MainLayout>
      <MaintenanceContent />
    </MainLayout>
  );
};

export default Maintenance;


