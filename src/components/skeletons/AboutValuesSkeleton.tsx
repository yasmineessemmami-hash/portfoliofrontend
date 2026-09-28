const AboutValuesSkeleton = () => {
  return (
    <section className="py-12 sm:py-16 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-6 w-64 mx-auto bg-muted/30 rounded-lg mb-8 sm:mb-10 animate-pulse" />
          <div className="grid sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 animate-pulse space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-muted/30 mb-2" />
                <div className="h-4 w-2/3 bg-muted/30 rounded-lg" />
                <div className="h-3 w-full bg-muted/20 rounded-lg" />
                <div className="h-3 w-11/12 bg-muted/20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutValuesSkeleton;


