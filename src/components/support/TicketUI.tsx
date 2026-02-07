import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaUser, FaShieldAlt, FaPaperclip, FaFileImage, FaFilePdf, FaFileAlt, FaDownload, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
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

interface MessageBubbleProps {
    message: any;
    isSelf: boolean;
    ticketId?: string;
    onEdit?: (messageId: string, content: string) => void;
    onDelete?: (messageId: string) => void;
    isEditPending?: boolean;
    isDeletePending?: boolean;
}

export const MessageBubble = ({
    message,
    isSelf,
    ticketId,
    onEdit,
    onDelete,
    isEditPending,
    isDeletePending
}: MessageBubbleProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isInternal = message.isInternal;
    const isAdmin = message.senderType === 'ADMIN';
    const isDeleted = message.isDeleted;
    const isEdited = message.editedAt;

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveEdit = () => {
        if (onEdit && editContent.trim() !== message.content) {
            onEdit(message.id, editContent.trim());
        }
        setIsEditing(false);
        setShowMenu(false);
    };

    const handleConfirmDelete = () => {
        if (onDelete) {
            onDelete(message.id);
        }
        setShowDeleteConfirm(false);
        setShowMenu(false);
    };

    if (isInternal) {
        return (
            <div className="flex justify-center my-4">
                <div className={`bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${isDeleted ? 'opacity-40' : ''}`}>
                    <FaExclamationCircle />
                    <span className="font-bold">Internal Note:</span> {message.content}
                    {isDeleted && <span className="ml-2 text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded">Deleted</span>}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex w-full mb-4 ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[80%] rounded-2xl p-4 ${isSelf
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-[#1C1E22] border border-neutral-700 text-neutral-200 rounded-bl-none'
                } ${isDeleted ? 'opacity-60' : ''}`}>

                {/* Header with actions menu */}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 opacity-50 text-xs">
                        {isAdmin && <FaShieldAlt />}
                        <span>{message.senderType}</span>
                        <span>•</span>
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isEdited && !isDeleted && onEdit && (
                            <span className="italic" title={`Edited: ${new Date(message.editedAt).toLocaleString()}`}>(edited)</span>
                        )}
                        {message.attachments?.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <FaPaperclip /> {message.attachments.length}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions menu for admin messages */}
                    {isAdmin && !isDeleted && onEdit && onDelete && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="opacity-50 hover:opacity-100 transition-opacity p-1"
                                title="Message actions"
                            >
                                <FaEllipsisV size={12} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-6 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-10 min-w-32">
                                    <button
                                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2 rounded-t-lg"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-800 text-red-400 flex items-center gap-2 rounded-b-lg"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content - Editable or display */}
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-black/30 border border-neutral-600 rounded-lg p-2 text-white resize-none min-h-20"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                                className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isEditPending || editContent.trim() === message.content}
                                className="px-3 py-1 text-xs bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
                            >
                                {isEditPending ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={`whitespace-pre-wrap ${isDeleted ? 'opacity-50' : ''}`}>{message.content}</p>
                        {isDeleted && (
                            <span className="inline-block mt-1 text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded">Deleted</span>
                        )}
                    </>
                )}

                <AttachmentList attachments={message.attachments} />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Message?</h3>
                        <p className="text-neutral-400 text-sm mb-4">This message will be marked as deleted and shown with a strikethrough. This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-neutral-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeletePending}
                                className="px-4 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-500 disabled:opacity-50"
                            >
                                {isDeletePending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};