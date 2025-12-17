import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaUser, FaShieldAlt } from 'react-icons/fa';

export const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        OPEN: 'bg-green-500/20 text-green-400 border-green-500/30',
        IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        RESOLVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        CLOSED: 'bg-neutral-800 text-neutral-500 border-neutral-700',
    };
    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${styles[status] || styles.CLOSED}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export const MessageBubble = ({ message, isSelf }: { message: any; isSelf: boolean }) => {
    const isInternal = message.isInternal;
    
    if (isInternal) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <FaExclamationCircle /> 
                    <span className="font-bold">Internal Note:</span> {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex w-full mb-4 ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
                isSelf 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-[#1C1E22] border border-neutral-700 text-neutral-200 rounded-bl-none'
            }`}>
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                    {message.senderType === 'ADMIN' && <FaShieldAlt />}
                    <span>{message.senderType}</span>
                    <span>•</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    );
};