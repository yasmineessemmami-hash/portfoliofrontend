const ProjectCardSkeleton = () => {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="w-16 h-16 bg-muted rounded-lg mb-4" />
      <div className="h-6 w-3/4 bg-muted rounded mb-2" />
      <div className="h-4 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-5/6 bg-muted rounded mb-4" />
      <div className="flex flex-wrap gap-2">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-6 w-16 bg-muted rounded"
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;

