import React from 'react';

interface SkillTagsProps {
    skills: string[] | string | null | undefined;
    className?: string;
}

export const SkillTags: React.FC<SkillTagsProps> = ({ skills, className = '' }) => {
    if (!skills) return null;

    let skillList: string[] = [];
    if (Array.isArray(skills)) {
        skillList = skills;
    } else if (typeof skills === 'string') {
        try {
            // Check if it's stored as JSON string representation
            const parsed = JSON.parse(skills);
            if (Array.isArray(parsed)) {
                skillList = parsed;
            } else {
                skillList = [skills];
            }
        } catch {
            // Split by comma
            skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
        }
    }

    if (skillList.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {skillList.map((skill, index) => (
                <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center px-3 py-1 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 rounded-full text-xs font-black shadow-sm transition-all hover:bg-brand-primary/10"
                >
                    {skill}
                </span>
            ))}
        </div>
    );
};
