interface TechBadgeProps {
    label: string;
}

const TechBadge = ({ label }: TechBadgeProps) => {
    return (
        <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
            {label}
        </span>
    );
};

export default TechBadge;


