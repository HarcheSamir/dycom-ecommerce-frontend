import { useState, useRef, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface FilterDropdownProps {
    icon: ReactNode;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}

export const FilterDropdown: FC<FilterDropdownProps> = ({ icon, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find(opt => opt.value === value)?.label;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 flex items-center justify-between px-4 rounded-lg bg-[#1C1E22] border border-neutral-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                <div className="flex items-center gap-3">
                    <span className="text-neutral-400">{icon}</span>
                    <span>{selectedLabel}</span>
                </div>
                <FaChevronDown className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-[#1C1E22] border border-neutral-700 rounded-lg z-10 shadow-lg">
                    {options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-800"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};