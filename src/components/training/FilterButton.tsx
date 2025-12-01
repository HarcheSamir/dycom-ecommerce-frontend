import type { FC, ReactNode } from 'react';

interface FilterButtonProps {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    isActive: boolean;
}

export const FilterButton: FC<FilterButtonProps> = ({ icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full h-12 flex items-center justify-center gap-3 px-4 rounded-lg text-sm font-semibold transition-colors ${isActive
            ? 'bg-gray-200 text-black'
            : 'bg-[#1C1E22] border border-neutral-700 text-white hover:bg-neutral-800'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);