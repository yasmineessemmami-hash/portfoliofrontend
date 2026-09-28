import ProjectCardSkeleton from "./ProjectCardSkeleton";

const FeaturedProjectsSkeleton = () => {
  return (
    <section className="py-20 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-4 w-32 h-8 mx-auto animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded mx-auto animate-pulse" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>

          <div className="text-center mt-10">
            <div className="h-5 w-32 bg-muted rounded mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjectsSkeleton;

