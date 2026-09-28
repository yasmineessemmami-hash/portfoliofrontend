const SocialIconsSkeleton = () => {
  return (
    <div className="relative z-10 py-8 px-4 sm:px-6 bg-background">
      <div className="flex items-center justify-center gap-3">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="w-11 h-11 bg-muted rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

export default SocialIconsSkeleton;

