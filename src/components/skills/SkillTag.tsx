interface SkillTagProps {
    label: string;
}

const SkillTag = ({ label }: SkillTagProps) => {
    return (
        <span className="px-4 py-2 bg-secondary hover:bg-primary/10 text-secondary-foreground rounded-lg text-sm font-medium transition-colors cursor-default">
            {label}
        </span>
    );
};

export default SkillTag;


