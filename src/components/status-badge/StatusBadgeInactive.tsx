interface StatusBadgeInactiveProps {
  text: string;
  className?: string;
}

const StatusBadgeInactive = ({ text, className = "" }: StatusBadgeInactiveProps) => {
  return (
    <div className={`inline-flex items-center gap-2 px-5 py-2.5 max-[430px]:px-4 max-[430px]:py-2 rounded-full glass mb-8 max-[430px]:mb-6 ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error/75 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
      </span>
      <span className="text-sm max-[430px]:text-xs font-medium text-muted-foreground">{text}</span>
    </div>
  );
};

export default StatusBadgeInactive;

