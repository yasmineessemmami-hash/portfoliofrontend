const DeliverablesSkeleton = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 animate-pulse">
            <div className="h-6 w-56 mx-auto bg-muted/30 rounded-lg mb-3" />
            <div className="h-4 w-64 mx-auto bg-muted/20 rounded-lg" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="glass rounded-2xl p-8 text-center animate-pulse space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted/30 mx-auto mb-4" />
                <div className="h-4 w-2/3 mx-auto bg-muted/30 rounded-lg" />
                <div className="h-3 w-full mx-auto bg-muted/20 rounded-lg" />
                <div className="h-3 w-11/12 mx-auto bg-muted/20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverablesSkeleton;


