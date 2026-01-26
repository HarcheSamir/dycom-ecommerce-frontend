import apiClient from '../lib/apiClient';

export interface ChatResponse {
    message: string;
}

export const agentService = {
    /**
     * Sends a user message to the AI agent and returns the response.
     */
    async sendMessage(message: string): Promise<string> {
        try {
            const response = await apiClient.post<any>('/academy-agent/chat', { message });

            if (response.data && response.data.answer) return response.data.answer;
            if (typeof response.data === 'string') return response.data;
            if (response.data && response.data.response) return response.data.response;
            if (response.data && response.data.message) return response.data.message;

            return "Je n'ai pas compris la réponse du serveur.";
        } catch (error: any) {
            console.error('Agent Service Error:', error);
            // If backend sent a specific message (e.g. rate limit), throw that.
            if (error.response && error.response.data && error.response.data.answer) {
                throw new Error(error.response.data.answer);
            }
            throw error;
        }
    }
};
