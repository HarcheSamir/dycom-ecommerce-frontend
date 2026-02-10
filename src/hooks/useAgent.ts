import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService, type AgentMessage } from '../services/agent.service';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useAgent = () => {
    const queryClient = useQueryClient();
    const [localMessages, setLocalMessages] = useState<AgentMessage[]>([]);

    // Fetch History & Quota
    const { data: history, isLoading, error } = useQuery({
        queryKey: ['agent-history'],
        queryFn: agentService.getHistory,
        refetchOnWindowFocus: false,
    });

    // Send Message Mutation
    const mutation = useMutation({
        mutationFn: agentService.sendMessage,
        onMutate: async (newMessage) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['agent-history'] });

            // Snapshot previous value
            const previousHistory = queryClient.getQueryData(['agent-history']);

            // Optimistically update to show user message immediately
            const optimisticUserMsg: AgentMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: newMessage,
                createdAt: new Date().toISOString()
            };

            setLocalMessages(prev => [...prev, optimisticUserMsg]);

            // Return context
            return { previousHistory };
        },
        onSuccess: (data) => {
            // valid response from backend (could be answer OR error info if quota exceeded)
            const botMsg: AgentMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                createdAt: new Date().toISOString()
            };
            setLocalMessages(prev => [...prev, botMsg]);

            if (data.quotaExceeded) {
                toast.error("Limite de messages atteinte pour aujourd'hui.");
            }

            // Invalidate to get fresh quota and real IDs
            queryClient.invalidateQueries({ queryKey: ['agent-history'] });
        },
        onError: (err, _newTodo, context) => {
            console.error(err);
            toast.error("Erreur lors de l'envoi du message.");
            if (context?.previousHistory) {
                queryClient.setQueryData(['agent-history'], context.previousHistory);
            }
        },
        onSettled: () => {
            // Merge local messages with server history efficiently or just clear local
            // Ideally we just rely on server history after invalidation, but for smooth UI we keep local until fetch
            setLocalMessages([]); // Clear local, let standard Query data take over
            queryClient.invalidateQueries({ queryKey: ['agent-history'] });
        }
    });

    // Merge server history with any pending local messages (though we clear local on success, this handles the interim)
    // Actually, simple approach: Display server history + local messages that are NOT yet in server history
    // But since we invalidate on success, simplicity is best:
    // Just use server history. The optimistic update is tricky with React Query if we don't manually manipulate the cache.
    // Let's refine the optimistic update to manipulate cache directly.

    // Combine history and local optimistic messages
    // Deduplicate based on ID just in case, though local IDs are temp dates
    const allMessages = [...(history?.messages || []), ...localMessages];

    return {
        messages: allMessages,
        remaining: history?.remaining ?? 10,
        isLoadingHistory: isLoading,
        isSending: mutation.isPending,
        sendMessage: mutation.mutate,
        error
    };
};
