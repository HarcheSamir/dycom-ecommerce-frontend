import type { FC, ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    padding?: string;
    onClick?: () => void;
}

export const GlassCard: FC<GlassCardProps> = ({ children, className = '', padding = 'p-6', onClick }) => (
    <div onClick={onClick} className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 hover:border-neutral-700 hover:-translate-y-1 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative h-full ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);