const AboutServicesSkeleton = () => {
  return (
    <section className="py-12 sm:py-16 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 animate-pulse">
            <div className="h-6 w-40 mx-auto bg-muted/30 rounded-lg mb-3" />
            <div className="h-4 w-64 mx-auto bg-muted/20 rounded-lg" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 sm:p-8 animate-pulse space-y-3"
              >
                <div className="h-5 w-2/3 bg-muted/30 rounded-lg" />
                <div className="h-4 w-full bg-muted/20 rounded-lg" />
                <div className="h-4 w-11/12 bg-muted/20 rounded-lg" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-5/6 bg-muted/20 rounded-lg" />
                  <div className="h-3 w-3/4 bg-muted/20 rounded-lg" />
                  <div className="h-3 w-2/3 bg-muted/20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutServicesSkeleton;


