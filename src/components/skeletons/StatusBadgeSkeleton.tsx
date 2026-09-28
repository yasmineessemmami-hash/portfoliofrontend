const StatusBadgeSkeleton = () => {
  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 max-[430px]:px-4 max-[430px]:py-2 rounded-full bg-muted animate-pulse">
      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
      <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
    </div>
  );
};

export default StatusBadgeSkeleton;

