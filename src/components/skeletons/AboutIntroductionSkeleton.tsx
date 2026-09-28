const AboutIntroductionSkeleton = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-6 sm:p-8 md:p-10 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left - Avatar & Availability */}
              <div className="shrink-0 w-full lg:w-auto flex flex-col items-center lg:items-start gap-4">
                <div className="w-28 h-28 rounded-2xl bg-muted/30" />
                <div className="h-8 w-40 bg-muted/20 rounded-full" />
              </div>

              {/* Right - Content */}
              <div className="flex-1 space-y-3">
                <div className="h-6 w-2/3 bg-muted/30 rounded-lg" />
                <div className="h-4 w-1/3 bg-muted/20 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted/20 rounded-lg" />
                  <div className="h-4 w-11/12 bg-muted/20 rounded-lg" />
                  <div className="h-4 w-10/12 bg-muted/20 rounded-lg" />
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 space-y-2">
                  <div className="h-3 w-40 bg-muted/20 rounded-lg" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-8 w-20 bg-muted/20 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutIntroductionSkeleton;


