const AboutWorkProcessSkeleton = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 animate-pulse">
            <div className="h-6 w-40 mx-auto bg-muted/30 rounded-lg mb-3" />
            <div className="h-4 w-64 mx-auto bg-muted/20 rounded-lg" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass rounded-xl p-6 animate-pulse">
                <div className="h-8 w-12 bg-muted/30 rounded-lg mb-3" />
                <div className="h-4 w-3/4 bg-muted/30 rounded-lg mb-2" />
                <div className="h-3 w-full bg-muted/20 rounded-lg mb-1" />
                <div className="h-3 w-11/12 bg-muted/20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutWorkProcessSkeleton;


