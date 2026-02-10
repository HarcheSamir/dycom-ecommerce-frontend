import apiClient from '../lib/apiClient';

export interface ChatResponse {
    answer: string;
    quotaExceeded: boolean;
    remaining: number;
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface HistoryResponse {
    messages: AgentMessage[];
    remaining: number;
}

export const agentService = {
    /**
     * Sends a user message to the AI agent and returns the response.
     */
    async sendMessage(message: string): Promise<ChatResponse> {
        try {
            const response = await apiClient.post<ChatResponse>('/academy-agent/chat', { message });
            return response.data;
        } catch (error: any) {
            console.error('Agent Service Error:', error);
            if (error.response && error.response.data && error.response.data.answer) {
                // Even if error (like rate limit from middleware), we might get an answer
                return {
                    answer: error.response.data.answer,
                    quotaExceeded: true,
                    remaining: 0
                };
            }
            throw error;
        }
    },

    /**
     * Fetches the conversation history and current quota.
     */
    async getHistory(): Promise<HistoryResponse> {
        const response = await apiClient.get<HistoryResponse>('/academy-agent/history');
        return response.data;
    }
};
