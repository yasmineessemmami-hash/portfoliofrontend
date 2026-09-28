import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./christmas-intro.css";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const GoldParticle = ({ particle }: { particle: Particle }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.size,
      background: "radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, transparent 70%)",
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.8, 0],
      scale: [0.5, 1.5, 0.5],
      y: [-20, 20],
    }}
    transition={{
      duration: particle.duration,
      delay: particle.delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

interface ChristmasIntroProps {
  onComplete?: () => void;
}

/**
 * Calculate the year range for Christmas greeting based on current date
 * 
 * Logic:
 * - If month is Oct-Dec (10-12): Show "CurrentYear — NextYear"
 *   Example: Dec 2025 → "2025 — 2026"
 * - If month is Jan-Mar (1-3): Show "PreviousYear — CurrentYear"
 *   Example: Jan 2025 → "2024 — 2025"
 */
const getYearRange = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so +1 for 1-12

  if (currentMonth >= 10 && currentMonth <= 12) {
    // October, November, December
    // Show: CurrentYear — NextYear
    return `${currentYear} — ${currentYear + 1}`;
  } else if (currentMonth >= 1 && currentMonth <= 3) {
    // January, February, March
    // Show: PreviousYear — CurrentYear
    return `${currentYear - 1} — ${currentYear}`;
  } else {
    // April-September: Default to current year range
    // Show: PreviousYear — CurrentYear (since we're past New Year)
    return `${currentYear - 1} — ${currentYear}`;
  }
};

export const ChristmasIntro = ({ onComplete }: ChristmasIntroProps = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<"enter" | "display" | "exit">("enter");

  // Calculate year range dynamically
  const yearRange = useMemo(() => getYearRange(), []);

  // Generate particles with random values (extracted to function to avoid linter error)
  const generateParticles = (): Particle[] => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  };

  const particles: Particle[] = useMemo(() => generateParticles(), []);

  useEffect(() => {
    const displayTimer = setTimeout(() => setPhase("display"), 500);
    const exitTimer = setTimeout(() => setPhase("exit"), 4200);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // Notify parent that intro is complete
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(displayTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-99999 flex items-center justify-center overflow-hidden christmas-intro-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: phase === "exit" ? 0.8 : 0.5 }}
      >
        {/* Background */}
        <div className="absolute inset-0 christmas-intro-bg">
          <motion.div
            className="absolute inset-0 bg-cover bg-center christmas-intro-bg-gradient"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 1.5 }}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 christmas-intro-gradient-overlay-1" />
        <div className="absolute inset-0 christmas-intro-gradient-overlay-2" />

        {/* Floating Gold Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <GoldParticle key={particle.id} particle={particle} />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-8 max-w-4xl">
          {/* Top Decorative Line */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="h-px w-32 christmas-intro-decorative-line-top"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            />
          </motion.div>

          {/* Small Greeting */}
          <motion.p
            className="text-lg tracking-[0.4em] uppercase mb-6 christmas-intro-greeting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Wishing You
          </motion.p>

          {/* Main Title */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider christmas-intro-title-merry"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span>Merry</span>
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-8">
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest christmas-intro-title-christmas"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Christmas
            </motion.h1>
          </div>

          {/* Decorative Element */}
          <motion.div
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <motion.div
              className="h-px w-20 christmas-intro-decorative-line-left"
              initial={{ scaleX: 0, originX: 1 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            />
            <motion.div
              className="w-2 h-2 rotate-45 christmas-intro-decorative-diamond"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{ delay: 1.6, duration: 0.4 }}
            />
            <motion.div
              className="h-px w-20 christmas-intro-decorative-line-right"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl italic tracking-wide christmas-intro-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            & a Prosperous New Year
          </motion.p>

          {/* Year */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <span className="text-sm tracking-[0.5em] christmas-intro-year">
              {yearRange}
            </span>
          </motion.div>

          {/* Bottom Decorative Line */}
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            <motion.div
              className="h-px w-32 christmas-intro-decorative-line-bottom"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.3, duration: 1 }}
            />
          </motion.div>
        </div>

        {/* Corner Accents */}
        <motion.div
          className="absolute top-8 left-8 w-16 h-16 christmas-intro-corner-accent-top-left"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        />
        <motion.div
          className="absolute top-8 right-8 w-16 h-16 christmas-intro-corner-accent-top-right"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9, duration: 0.6 }}
        />
        <motion.div
          className="absolute bottom-8 left-8 w-16 h-16 christmas-intro-corner-accent-bottom-left"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-16 h-16 christmas-intro-corner-accent-bottom-right"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.1, duration: 0.6 }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

