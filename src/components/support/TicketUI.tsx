import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaUser, FaShieldAlt, FaPaperclip, FaFileImage, FaFilePdf, FaFileAlt, FaDownload } from 'react-icons/fa';
import type { TicketAttachment } from '../../hooks/useSupport';

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

// Helper to get file icon based on mime type
const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FaFileAlt />;
    if (mimeType.startsWith('image/')) return <FaFileImage className="text-blue-400" />;
    if (mimeType === 'application/pdf') return <FaFilePdf className="text-red-400" />;
    return <FaFileAlt className="text-neutral-400" />;
};

// Helper to format file size
const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper to check if file is an image
const isImageFile = (mimeType?: string) => {
    return mimeType?.startsWith('image/');
};

// Attachment display component
const AttachmentList = ({ attachments }: { attachments?: TicketAttachment[] }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-3 space-y-2">
            {attachments.map(file => (
                <div key={file.id}>
                    {isImageFile(file.mimeType) ? (
                        // Image preview
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <img
                                src={file.fileUrl}
                                alt={file.fileName}
                                className="max-w-xs max-h-48 rounded-lg border border-neutral-600 hover:opacity-80 transition-opacity"
                            />
                            <span className="text-xs text-neutral-400 mt-1 block">{file.fileName}</span>
                        </a>
                    ) : (
                        // File download link
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-black/30 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors group"
                        >
                            {getFileIcon(file.mimeType)}
                            <span className="flex-1 truncate text-sm">{file.fileName}</span>
                            {file.fileSize && (
                                <span className="text-xs text-neutral-500">{formatFileSize(file.fileSize)}</span>
                            )}
                            <FaDownload className="text-neutral-500 group-hover:text-blue-400 transition-colors" />
                        </a>
                    )}
                </div>
            ))}
        </div>
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
            <div className={`max-w-[80%] rounded-2xl p-4 ${isSelf
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-[#1C1E22] border border-neutral-700 text-neutral-200 rounded-bl-none'
                }`}>
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                    {message.senderType === 'ADMIN' && <FaShieldAlt />}
                    <span>{message.senderType}</span>
                    <span>•</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.attachments?.length > 0 && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <FaPaperclip /> {message.attachments.length}
                            </span>
                        </>
                    )}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <AttachmentList attachments={message.attachments} />
            </div>
        </div>
    );
};