const AboutStatsSkeleton = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 text-center animate-pulse"
              >
                <div className="w-6 h-6 mx-auto mb-3 bg-muted/40 rounded-full" />
                <div className="h-6 w-1/2 mx-auto bg-muted/30 rounded-lg mb-2" />
                <div className="h-3 w-3/4 mx-auto bg-muted/20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStatsSkeleton;


