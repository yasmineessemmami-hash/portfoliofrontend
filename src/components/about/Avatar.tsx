
import { useState } from "react";
import type { AboutAvatar } from "@/types/about.types";

interface AvatarProps {
    avatar: AboutAvatar;
}

const Avatar = ({ avatar }: AvatarProps) => {
    const [hasError, setHasError] = useState(false);

    if (avatar.image && !hasError) {
        return (
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-glow bg-surface">
                <img
                    src={avatar.image}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    return (
        <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-primary to-primary/50 flex items-center justify-center shadow-glow">
            <span className="font-heading text-4xl sm:text-5xl font-bold text-primary-foreground">
                {avatar.letter}
            </span>
        </div>
    );
};

export default Avatar;

