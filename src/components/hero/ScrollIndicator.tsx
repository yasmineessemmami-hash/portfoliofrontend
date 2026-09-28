interface ScrollIndicatorProps {
  className?: string;
}

const ScrollIndicator = ({ className = "" }: ScrollIndicatorProps) => {
  return (
    <div
      className={`absolute bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-fade-up stagger-5 ${className}`}
    >
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-muted-foreground/60">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest">Scroll</span>
        <div className="relative w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary animate-scroll-mouse"></div>
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;

