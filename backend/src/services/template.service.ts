/**
 * Template Service
 * Business logic for task templates
 */

import { Priority } from '@prisma/client';
import { templateRepository } from '../repositories/template.repository.js';
import { AppError } from '../lib/errors.js';

export interface CreateTemplateDto {
    name: string;
    title: string;
    description: string;
    priority: string;
    isGlobal?: boolean;
}

export const templateService = {
    /**
     * Get all templates available to a user
     */
    async getTemplates(userId: string) {
        return templateRepository.findAllForUser(userId);
    },

    /**
     * Get a single template by ID
     */
    async getTemplateById(id: string, userId: string) {
        const template = await templateRepository.findById(id);
        if (!template) {
            throw AppError.notFound('Template not found');
        }
        // Check access: must be creator or template must be global
        if (template.creatorId !== userId && !template.isGlobal) {
            throw AppError.forbidden('You do not have access to this template');
        }
        return template;
    },

    /**
     * Create a new template
     */
    async createTemplate(data: CreateTemplateDto, userId: string) {
        return templateRepository.create({
            name: data.name,
            title: data.title,
            description: data.description,
            priority: data.priority as Priority,
            isGlobal: data.isGlobal ?? false,
            creatorId: userId,
        });
    },

    /**
     * Delete a template
     * Only the creator can delete their template
     */
    async deleteTemplate(id: string, userId: string) {
        const template = await templateRepository.findById(id);
        if (!template) {
            throw AppError.notFound('Template not found');
        }
        if (template.creatorId !== userId) {
            throw AppError.forbidden('Only the template creator can delete this template');
        }
        await templateRepository.delete(id);
        return { success: true };
    },

    /**
     * Update a template
     * Only the creator can update their template
     */
    async updateTemplate(id: string, data: Partial<CreateTemplateDto>, userId: string) {
        const template = await templateRepository.findById(id);
        if (!template) {
            throw AppError.notFound('Template not found');
        }
        if (template.creatorId !== userId) {
            throw AppError.forbidden('Only the template creator can update this template');
        }
        return templateRepository.update(id, {
            name: data.name,
            title: data.title,
            description: data.description,
            priority: data.priority as Priority | undefined,
            isGlobal: data.isGlobal,
        });
    },
};
