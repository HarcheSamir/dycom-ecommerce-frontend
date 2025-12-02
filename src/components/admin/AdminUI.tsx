import React, { type FC } from 'react';

// Reusable Glass Card Component
export const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%,rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// Dashboard Container Card
export const DashboardCard: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className = '' }) => (
    <div className={`bg-[#1C1E22] border border-neutral-800 rounded-2xl p-6 ${className}`}>
        {children}
    </div>
);

// Main Stat Card
export const StatCard: FC<{ icon: React.ReactNode; value: string; label: string; change?: string; }> = ({ icon, value, label, change }) => (
    <GlassCard padding="p-5">
        <div className="flex justify-between items-start">
            <div className="bg-[#1C1E22] border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400">
                {icon}
            </div>
            {change && <span className="text-xs font-semibold text-green-400 flex items-center gap-1">↑ {change}</span>}
        </div>
        <p className="text-4xl font-bold text-white mt-4">{value}</p>
        <p className="text-neutral-400 text-sm mt-1">{label}</p>
    </GlassCard>
);

// Small Stat Card
export const SmallStatCard: FC<{ icon: React.ReactNode; value: string; label: string; }> = ({ icon, value, label }) => (
    <DashboardCard>
        <div className="flex justify-between items-center text-neutral-400">{icon}</div>
        <p className="text-3xl font-bold text-white mt-3">{value}</p>
        <p className="text-sm text-neutral-400">{label}</p>
    </DashboardCard>
);