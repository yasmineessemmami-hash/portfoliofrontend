import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone } from "lucide-react";
import StatusBadge from "@/components/status-badge/StatusBadge";
import ScrollIndicator from "./ScrollIndicator";
import type { Hero, Contact } from "@/types/home.types";

interface HeroSectionProps {
  hero: Hero;
  contact: Contact;
}

const HeroSection = ({ hero, contact }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full opacity-20 blur-3xl bg-hero-primary" />
        <div className="absolute bottom-1/6 right-1/4 w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full opacity-10 blur-3xl bg-hero-accent" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-soft pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-5">
          {/* Status badge */}
          <div className="opacity-0 animate-fade-up">
            <StatusBadge statusBadge={hero.status_badge} className="mb-0" />
          </div>

          {/* Main heading */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground opacity-0 animate-fade-up stagger-1 leading-tight">
            Hi, I&apos;m{" "}
            <span className="text-gradient relative inline-block">
              {hero.full_name}
              <span className="absolute -inset-1 blur-2xl opacity-30 bg-hero-name-glow" />
            </span>
          </h1>

          {/* Role */}
          <p className="font-heading text-lg sm:text-2xl md:text-3xl text-muted-foreground opacity-0 animate-fade-up stagger-2">
            {hero.role_title}
          </p>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto opacity-0 animate-fade-up stagger-3 leading-relaxed">
            {hero.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 opacity-0 animate-fade-up stagger-4">
            <Link
              to="/projects"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-glow hover:scale-[1.02]"
            >
              View Projects
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-4 glass rounded-xl font-semibold text-foreground hover:bg-surface-hover transition-all hover:scale-[1.02]"
            >
              Contact Me
            </Link>
          </div>

          {/* Quick Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-muted-foreground pb-16 sm:pb-20 opacity-0 animate-fade-up stagger-5">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator />
    </section>
  );
};

export default HeroSection;

