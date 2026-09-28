import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa6";
import type { SocialLink } from "@/types/home.types";

interface FooterProps {
  name: string;
  year?: number;
  socialLinks: SocialLink[];
}

const Footer = ({ name, year = new Date().getFullYear(), socialLinks }: FooterProps) => {
  // Extract specific social links for footer
  const githubLink = socialLinks.find((link) => link.platform.toLowerCase() === "github");
  const linkedinLink = socialLinks.find((link) => link.platform.toLowerCase() === "linkedin");
  const emailLink = socialLinks.find((link) => link.platform.toLowerCase() === "email");

  return (
    <footer className="border-t border-border/50 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Top Row: Name & Social Icons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="font-heading font-bold text-base sm:text-lg text-foreground">{name}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">© {year}</span>
            </div>

            <div className="flex items-center gap-3">
              {githubLink && (
                <a
                  href={githubLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {linkedinLink && (
                <a
                  href={linkedinLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {emailLink && (
                <a
                  href={emailLink.url}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Email"
                >
                  <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Bottom Row: Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-0 text-xs sm:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors whitespace-nowrap">
              About
            </Link>
            <Link to="/services" className="hover:text-primary transition-colors whitespace-nowrap">
              Services
            </Link>
            <Link to="/projects" className="hover:text-primary transition-colors whitespace-nowrap">
              Projects
            </Link>
            <Link to="/skills" className="hover:text-primary transition-colors whitespace-nowrap">
              Skills
            </Link>
            <Link to="/blog" className="hover:text-primary transition-colors whitespace-nowrap">
              Blog
            </Link>
            <Link to="/faq" className="hover:text-primary transition-colors whitespace-nowrap">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors whitespace-nowrap">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
