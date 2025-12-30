/**
 * AI Assistant Controller
 * Handles AI chat interactions
 */

import { Request, Response, NextFunction } from 'express';
import { aiService, AI_FUNCTIONS, SYSTEM_PROMPT, ChatMessage, AIContext } from '../services/ai.service.js';

export const aiController = {
    /**
     * POST /api/v1/ai/chat
     * Send a message to the AI assistant
     */
    async chat(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, conversationId } = req.body;
            const userId = (req as any).user!.id;
            const tenantScope = (req as any).tenantScope;

            if (!message || typeof message !== 'string') {
                return res.status(400).json({ success: false, message: 'Message is required' });
            }

            // Build AI context from user session
            const context: AIContext = {
                userId,
                organizationId: tenantScope?.organizationId || null,
                teamIds: [], // Could be enhanced to fetch user's teams
                userRole: (req as any).user!.role,
            };

            // Get existing conversation
            const conversation = await aiService.getConversation(userId);
            const messages: ChatMessage[] = conversation.messages || [];

            // Add user message
            messages.push({ role: 'user', content: message });

            // For demo purposes, we'll simulate AI response with function execution
            // In production, this would call OpenAI/Gemini API
            const aiResponse = await simulateAIResponse(message, context, messages);

            // Add assistant response
            messages.push({ role: 'assistant', content: aiResponse.response });

            // Save conversation
            await aiService.saveConversation(userId, messages.slice(-20)); // Keep last 20 messages

            res.json({
                success: true,
                data: {
                    response: aiResponse.response,
                    functionCalled: aiResponse.functionCalled,
                    functionResult: aiResponse.functionResult,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/ai/conversation
     * Get conversation history
     */
    async getConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            const conversation = await aiService.getConversation(userId);
            res.json({ success: true, data: conversation });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/v1/ai/conversation
     * Clear conversation history
     */
    async clearConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            await aiService.saveConversation(userId, []);
            res.json({ success: true, message: 'Conversation cleared' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/ai/functions
     * Get available AI functions (for documentation)
     */
    async getFunctions(_req: Request, res: Response, next: NextFunction) {
        try {
            res.json({ success: true, data: AI_FUNCTIONS });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/ai/categorize
     * Auto-categorize a task based on title/description
     */
    async categorize(req: Request, res: Response, next: NextFunction) {
        try {
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ success: false, message: 'Title is required' });
            }

            const text = `${title} ${description || ''}`.toLowerCase();

            // Simple keyword-based categorization
            let priority = 'MEDIUM';
            const labels: string[] = [];

            // Priority detection
            if (text.includes('urgent') || text.includes('asap') || text.includes('critical')) {
                priority = 'URGENT';
            } else if (text.includes('important') || text.includes('high priority') || text.includes('deadline')) {
                priority = 'HIGH';
            } else if (text.includes('when possible') || text.includes('low priority') || text.includes('nice to have')) {
                priority = 'LOW';
            }

            // Label detection
            if (text.includes('bug') || text.includes('fix') || text.includes('error')) labels.push('bug');
            if (text.includes('feature') || text.includes('new') || text.includes('add')) labels.push('feature');
            if (text.includes('docs') || text.includes('documentation')) labels.push('documentation');
            if (text.includes('test') || text.includes('testing')) labels.push('testing');
            if (text.includes('review') || text.includes('pr') || text.includes('pull request')) labels.push('review');
            if (text.includes('deploy') || text.includes('release')) labels.push('deployment');
            if (text.includes('security') || text.includes('auth')) labels.push('security');
            if (text.includes('performance') || text.includes('optimize')) labels.push('performance');

            res.json({
                success: true,
                data: {
                    suggestedPriority: priority,
                    suggestedLabels: labels.slice(0, 3), // Max 3 labels
                    confidence: labels.length > 0 ? 0.8 : 0.5,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};

/**
 * Simulate AI response (replace with actual LLM call in production)
 */
async function simulateAIResponse(
    message: string,
    context: AIContext,
    history: ChatMessage[]
): Promise<{ response: string; functionCalled?: string; functionResult?: any }> {
    const lowerMessage = message.toLowerCase();

    // Pattern matching for common intents
    if (lowerMessage.includes('create') && lowerMessage.includes('task')) {
        // Extract task details from message
        const titleMatch = message.match(/(?:called|named|titled)\s+["']?([^"'\n,]+)["']?/i);
        const title = titleMatch?.[1] || 'New Task from AI';

        const result = await aiService.executeFunction('create_task', {
            title,
            description: 'Created via AI assistant',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: lowerMessage.includes('urgent') ? 'URGENT' :
                lowerMessage.includes('high') ? 'HIGH' : 'MEDIUM',
        }, context);

        if (result.success) {
            return {
                response: `✅ Created task "${result.result.title}" with ${result.result.priority} priority, due ${new Date(result.result.dueDate).toLocaleDateString()}.`,
                functionCalled: 'create_task',
                functionResult: result.result,
            };
        } else {
            return { response: `❌ Failed to create task: ${result.error}` };
        }
    }

    if (lowerMessage.includes('list') || lowerMessage.includes('show') || lowerMessage.includes('what')) {
        const filters: any = {};
        if (lowerMessage.includes('overdue')) filters.overdue = true;
        if (lowerMessage.includes('urgent')) filters.priority = 'URGENT';
        if (lowerMessage.includes('high')) filters.priority = 'HIGH';
        if (lowerMessage.includes('completed')) filters.status = 'COMPLETED';
        if (lowerMessage.includes('todo')) filters.status = 'TODO';
        if (lowerMessage.includes('my')) filters.assignedToMe = true;

        const result = await aiService.executeFunction('list_tasks', filters, context);

        if (result.success) {
            const tasks = result.result;
            if (tasks.length === 0) {
                return { response: '📋 No tasks found matching your criteria.' };
            }
            const taskList = tasks.slice(0, 5).map((t: any, i: number) =>
                `${i + 1}. **${t.title}** [${t.priority}] - ${t.status}`
            ).join('\n');

            return {
                response: `📋 Found ${tasks.length} tasks:\n\n${taskList}${tasks.length > 5 ? `\n\n...and ${tasks.length - 5} more` : ''}`,
                functionCalled: 'list_tasks',
                functionResult: tasks,
            };
        } else {
            return { response: `❌ Failed to list tasks: ${result.error}` };
        }
    }

    if (lowerMessage.includes('analytics') || lowerMessage.includes('summary') || lowerMessage.includes('stats')) {
        const result = await aiService.executeFunction('get_analytics', { type: 'overview' }, context);

        if (result.success) {
            const stats = result.result;
            return {
                response: `📊 **Task Overview**\n\n` +
                    `• Total Tasks: ${stats.total}\n` +
                    `• Completed: ${stats.completed}\n` +
                    `• In Progress: ${stats.inProgress}\n` +
                    `• Overdue: ${stats.overdue}`,
                functionCalled: 'get_analytics',
                functionResult: stats,
            };
        } else {
            return { response: `❌ Failed to get analytics: ${result.error}` };
        }
    }

    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
        const queryMatch = message.match(/(?:search|find)\s+(?:for\s+)?["']?([^"'\n]+)["']?/i);
        const query = queryMatch?.[1]?.trim() || message;

        const result = await aiService.executeFunction('search_tasks', { query }, context);

        if (result.success) {
            const tasks = result.result;
            if (tasks.length === 0) {
                return { response: `🔍 No tasks found matching "${query}".` };
            }
            return {
                response: `🔍 Found ${tasks.length} tasks matching "${query}"`,
                functionCalled: 'search_tasks',
                functionResult: tasks,
            };
        }
    }

    // Default response
    return {
        response: `I can help you with:\n\n` +
            `• **Create tasks**: "Create a task called Review PR with high priority"\n` +
            `• **List tasks**: "Show my overdue tasks" or "List urgent tasks"\n` +
            `• **Analytics**: "Show me task summary" or "Give me analytics"\n` +
            `• **Search**: "Find tasks about deployment"\n\n` +
            `How can I assist you?`,
    };
}
