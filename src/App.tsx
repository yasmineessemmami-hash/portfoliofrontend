import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition, Suspense } from "react";
import type { ComponentType } from "react";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Projects from "@/pages/Projects";
import Skills from "@/pages/Skills";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import Maintenance from "@/pages/Maintenance";
import ServerError from "@/pages/ServerError";
import LoadingState from "@/components/ui/LoadingState";
import { useCommon } from "@/hooks/useCommon";
import { useTheme } from "@/theme/useTheme";
import { useThemeEffectToggle } from "@/hooks/useThemeEffectToggle";
import { CommonProvider } from "@/context/CommonContext";
import { SiteConfigProvider, useSiteConfigContext } from "@/context/SiteConfigContext";
import { IntroProvider, useIntroContext } from "@/context/IntroContext";
import { applyTheme } from "@/theme/applyTheme";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { getThemeComponents, hasIntro, hasOverlay, type ThemeName } from "@/seasonal/themeRegistry";
import { ThemeEffectToggle } from "@/seasonal/ThemeEffectToggle";
import { Snowflake } from "lucide-react";
import { AdminLayout, ProtectedRoute } from "@/components/Admin";
import AdminDashboard from "@/pages/Admin/Dashboard";
import AdminCommonSettings from "@/pages/Admin/CommonSettings";
import AdminThemeSettings from "@/pages/Admin/ThemeSettings";
import AdminHomeEditor from "@/pages/Admin/HomeAdmin";
import AdminAboutEditor from "@/pages/Admin/AboutAdmin";
import AdminServicesEditor from "@/pages/Admin/ServicesAdmin";
import AdminProjectsEditor from "@/pages/Admin/ProjectsAdmin";
import AdminSkillsEditor from "@/pages/Admin/SkillsAdmin";
import AdminBlogEditor from "@/pages/Admin/BlogAdmin";
import AdminFAQEditor from "@/pages/Admin/FAQAdmin";
import AdminContactEditor from "@/pages/Admin/ContactAdmin";
import AdminContactSubmissions from "@/pages/Admin/ContactSubmissionsAdmin";
import AdminCacheManagement from "@/pages/Admin/CacheManagementAdmin";
import AdminReplays from "@/pages/Admin/ReplaysAdmin";
import AdminReplayViewer from "@/pages/Admin/ReplayViewerAdmin";
import AdminKeys from "@/pages/Admin/KeysAdmin";
import AdminLogin from "@/pages/Admin/Login";
import { AuthProvider } from "@/context/AuthContext";
import { useSessionRecording } from "@/hooks/useSessionRecording";
import type { CommonResponse } from "@/types/common.types";

const AppContentInner = () => {
  // ============================================================================
  // PARALLEL DATA FETCHING
  // ============================================================================
  // These hooks run IMMEDIATELY and in PARALLEL when component mounts.
  // Data fetching happens in the background even while intro is showing.
  // This improves performance by loading data during the intro animation.
  // ============================================================================
  // Get site config from context (fetched once in SiteConfigProvider)
  const { siteConfig, loading: siteConfigLoading } = useSiteConfigContext();
  const { data, loading, error } = useCommon(); // Uses site config from context
  const { seasonalTheme, loading: themeLoading } = useTheme(); // Uses site config from context
  const { introCompleted, setIntroCompleted } = useIntroContext();
  const location = useLocation();
  const previousThemeNameRef = useRef<ThemeName | null>(null);
  const [previousThemeName, setPreviousThemeName] = useState<ThemeName | null>(null);

  // Apply theme when site config is loaded
  useEffect(() => {
    if (siteConfig) {
      applyTheme(siteConfig);
    }
  }, [siteConfig]);

  // Check if we're in admin route - admin should always use normal theme (no event themes)
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Initialize session recording (only for guest users, hook handles admin check)
  useSessionRecording();

  // Get theme components for current seasonal theme
  // Force normal theme for admin routes (no event themes in admin panel)
  const themeName = (isAdminRoute ? "normal" : (seasonalTheme || "normal")) as ThemeName;
  const themeComponents = getThemeComponents(themeName);
  const hasIntroComponent = hasIntro(themeName);
  const hasOverlayComponent = hasOverlay(themeName);

  // Theme-specific effect toggle (snow for christmas, can be extended for other themes)
  const effectToggle = useThemeEffectToggle(
    themeName,
    themeName === "christmas" ? "snow" : "effect"
  );

  // Compute theme change detection from state (derived values, not stored in effect)
  const themeChanged = useMemo(
    () => previousThemeName !== null && previousThemeName !== themeName,
    [previousThemeName, themeName]
  );
  const isFirstLoad = useMemo(
    () => previousThemeName === null,
    [previousThemeName]
  );

  // Update previous theme name state when theme changes (separate effect to avoid setState in useLayoutEffect)
  useEffect(() => {
    if (!themeLoading && previousThemeNameRef.current !== themeName) {
      previousThemeNameRef.current = themeName;
      // Use startTransition to mark this as a non-urgent update
      startTransition(() => {
        setPreviousThemeName(themeName);
      });
    }
  }, [themeName, themeLoading]);

  // Reset intro completed state when theme changes
  // Use useLayoutEffect to reset synchronously before paint to prevent flash
  useLayoutEffect(() => {
    if (!themeLoading && hasIntroComponent) {
      // If theme changed or first load, reset intro completed synchronously
      if (themeChanged || isFirstLoad) {
        setIntroCompleted(false);
      }
    }
  }, [themeName, themeLoading, hasIntroComponent, themeChanged, isFirstLoad, setIntroCompleted]);

  // Determine if we should show the intro
  useEffect(() => {
    // Mark intro as completed if theme doesn't have an intro component
    if (!themeLoading && !hasIntroComponent && !introCompleted) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setIntroCompleted(true);
      }, 0);
    }
  }, [themeLoading, hasIntroComponent, introCompleted, setIntroCompleted]);

  // Direct check for intro rendering - prevents flash by checking conditions synchronously
  // CRITICAL: If theme just finished loading AND has intro component, ALWAYS show intro
  // This prevents any app content from flashing before intro appears
  // On first load (isFirstLoad), always show intro if theme has one, regardless of introCompleted state
  const needsIntroRender = !isAdminRoute && !themeLoading && hasIntroComponent && themeComponents?.Intro &&
    (!introCompleted || themeChanged || isFirstLoad);


  // ============================================================================
  // RENDER PRIORITY LOGIC
  // ============================================================================
  // 0. While site config or theme is loading → show LoadingState
  // 1. If theme has intro → show intro immediately (blocks all UI)
  // 2. After intro completes (or if no intro) → show app content
  // ============================================================================

  // Step 0: Show loading while site config or theme info is being fetched
  if (siteConfigLoading || themeLoading) {
    return <LoadingState />;
  }

  // Step 1: If we should show intro, render it immediately (don't render app content yet)
  // This prevents any flash of content before the intro appears
  if (needsIntroRender) {
    return (
      <Suspense fallback={<LoadingState />}>
        <themeComponents.Intro onComplete={() => setIntroCompleted(true)} />
      </Suspense>
    );
  }

  // Step 2 & 3: Render app content
  const renderAppContent = () => {
    // If common data is still loading
    if (loading) {
      return <LoadingState />;
    }

    const common = data ?? null;

    // If error and not admin route, show error
    // CRITICAL: We only show ServerError if we're NOT showing an intro
    if (error && !isAdminRoute) {
      return <ServerError />;
    }

    // For admin routes, allow access even if data is null (empty database scenario)
    // Admin can then fill in configurations
    if (!common && isAdminRoute) {
      // Provide minimal common structure for admin when database is empty
      const emptyCommon: CommonResponse = {
        site: {
          mode: "normal",
          estimated_date: null,
          theme: "normal",
        },
        full_name: "",
        contact: {
          email: "",
          phone: "",
        },
        social_links: [],
        seasonalTheme: null,
      };

      return (
        <CommonProvider value={emptyCommon}>
          <Routes>
            {/* Admin Login - Public */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes - Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="common" element={<AdminCommonSettings />} />
              <Route path="theme" element={<AdminThemeSettings />} />
              <Route path="home" element={<AdminHomeEditor />} />
              <Route path="about" element={<AdminAboutEditor />} />
              <Route path="services" element={<AdminServicesEditor />} />
              <Route path="projects" element={<AdminProjectsEditor />} />
              <Route path="skills" element={<AdminSkillsEditor />} />
              <Route path="blog" element={<AdminBlogEditor />} />
              <Route path="faq" element={<AdminFAQEditor />} />
              <Route path="contact" element={<AdminContactEditor />} />
              <Route path="cache" element={<AdminCacheManagement />} />
              <Route path="replays" element={<AdminReplays />} />
              <Route path="replays/:sessionId" element={<AdminReplayViewer />} />
              <Route path="keys" element={<AdminKeys />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CommonProvider>
      );
    }

    const mode = common?.site?.mode ?? "normal";

    // If site is in maintenance mode and not on admin route, redirect to maintenance page
    if (mode === "maintenance" && !isAdminRoute) {
      return (
        <CommonProvider value={common}>
          <Maintenance />
        </CommonProvider>
      );
    }

    // Routes ALWAYS render (even during intro) so page hooks (useHome, useProjects, etc.) can run
    // Content is hidden visually by intro overlay, but hooks fetch data in background
    return (
      <CommonProvider value={common}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/maintenance" element={<Maintenance />} />

          {/* Admin Login - Public */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="common" element={<AdminCommonSettings />} />
            <Route path="theme" element={<AdminThemeSettings />} />
            <Route path="home" element={<AdminHomeEditor />} />
            <Route path="about" element={<AdminAboutEditor />} />
            <Route path="services" element={<AdminServicesEditor />} />
            <Route path="projects" element={<AdminProjectsEditor />} />
            <Route path="skills" element={<AdminSkillsEditor />} />
            <Route path="blog" element={<AdminBlogEditor />} />
            <Route path="faq" element={<AdminFAQEditor />} />
            <Route path="contact" element={<AdminContactEditor />} />
            <Route path="contact/submissions" element={<AdminContactSubmissions />} />
            <Route path="cache" element={<AdminCacheManagement />} />
            <Route path="replays" element={<AdminReplays />} />
            <Route path="replays/:sessionId" element={<AdminReplayViewer />} />
            <Route path="keys" element={<AdminKeys />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </CommonProvider>
    );
  };

  // Step 4: Show overlay after intro completes (if theme has overlay AND user hasn't disabled it)
  // Never show overlay/intro in admin routes - admin always uses normal theme
  const showOverlay = !isAdminRoute && introCompleted && hasOverlayComponent && themeComponents?.Overlay && effectToggle.effectEnabled;

  // Get theme-specific icon for toggle button
  const getThemeEffectIcon = (): ComponentType<{ className?: string }> => {
    switch (themeName) {
      case "christmas":
        return Snowflake;
      default:
        return Snowflake; // Default fallback
    }
  };

  return (
    <>
      {/* 
        App content: shown only after intro completes or if no intro is needed.
        Visibility is used to keep components mounted for parallel hook execution
        while preventing them from being seen during the intro transition.
      */}
      <div style={{ visibility: !isAdminRoute && !introCompleted && hasIntroComponent ? 'hidden' : 'visible' }}>
        {renderAppContent()}
      </div>

      {/* Theme overlay - only after intro completes and if user hasn't disabled it */}
      {showOverlay && themeComponents.Overlay && (
        <Suspense fallback={null}>
          <themeComponents.Overlay />
        </Suspense>
      )}

      {/* Theme effect toggle button - only show when theme has overlay and intro completed (never in admin) */}
      {!isAdminRoute && introCompleted && hasOverlayComponent && (
        <ThemeEffectToggle
          effectEnabled={effectToggle.effectEnabled}
          onToggle={effectToggle.toggleEffect}
          Icon={getThemeEffectIcon()}
          enabledLabel={
            themeName === "christmas"
              ? "Turn off snow effect"
              : "Turn off effect"
          }
          disabledLabel={
            themeName === "christmas"
              ? "Turn on snow effect"
              : "Turn on effect"
          }
        />
      )}
    </>
  );
};

const AppContent = () => {
  return (
    <AuthProvider>
      <SiteConfigProvider>
        <IntroProvider>
          <AppContentInner />
        </IntroProvider>
      </SiteConfigProvider>
    </AuthProvider>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;


