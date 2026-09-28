const ServicesGridSkeleton = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="glass rounded-2xl p-6 sm:p-8 animate-pulse space-y-3"
              >
                <div className="w-14 h-14 rounded-xl bg-muted/30 mb-4" />
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

export default ServicesGridSkeleton;


