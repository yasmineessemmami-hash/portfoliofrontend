const HeroSkeleton = () => {
  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      {/* Background Effects Skeleton */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl bg-muted animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-muted animate-pulse" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-size[60px_60px]" />

      {/* Main Content Skeleton */}
      <div className="flex-1 flex items-center justify-center pt-20 max-[430px]:pt-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Status Badge Skeleton */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 max-[430px]:px-4 max-[430px]:py-2 rounded-full bg-muted mb-8 max-[430px]:mb-6 animate-pulse">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
          </div>

          {/* Heading Skeleton */}
          <div className="mb-6 max-[430px]:mb-4">
            <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-3/4 mx-auto bg-muted rounded-lg animate-pulse mb-4" />
          </div>

          {/* Role Skeleton */}
          <div className="h-8 sm:h-10 md:h-12 w-2/3 mx-auto bg-muted rounded-lg animate-pulse mb-6 max-[430px]:mb-4" />

          {/* Subheadline Skeleton */}
          <div className="max-w-2xl mx-auto mb-10 max-[430px]:mb-6">
            <div className="h-4 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6 mx-auto" />
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-[430px]:gap-3 mb-10 max-[430px]:mb-6">
            <div className="h-12 max-[430px]:h-10 w-full sm:w-48 bg-muted rounded-xl animate-pulse" />
            <div className="h-12 max-[430px]:h-10 w-full sm:w-48 bg-muted rounded-xl animate-pulse" />
          </div>

          {/* Contact Info Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-[430px]:gap-3 sm:gap-8 pb-24 max-[430px]:pb-20 sm:pb-20">
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator Skeleton */}
      <div className="absolute bottom-2 max-[430px]:bottom-1 sm:bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
          <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-muted-foreground/20" />
        </div>
      </div>
    </section>
  );
};

export default HeroSkeleton;

