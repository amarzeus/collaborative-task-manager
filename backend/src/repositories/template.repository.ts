/**
 * Template Repository
 * Data access layer for task templates
 */

import { prisma } from '../lib/prisma.js';
import { Priority } from '@prisma/client';

export interface CreateTemplateData {
  name: string;
  title: string;
  description: string;
  priority: Priority;
  isGlobal?: boolean;
  creatorId: string;
}

export const templateRepository = {
  /**
   * Create a new template
   */
  async create(data: CreateTemplateData) {
    return prisma.taskTemplate.create({
      data: {
        name: data.name,
        title: data.title,
        description: data.description,
        priority: data.priority,
        isGlobal: data.isGlobal ?? false,
        creatorId: data.creatorId,
      },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    });
  },

  /**
   * Find all templates for a user (their own + global)
   */
  async findAllForUser(userId: string) {
    return prisma.taskTemplate.findMany({
      where: {
        OR: [{ creatorId: userId }, { isGlobal: true }],
      },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isGlobal: 'desc' }, { name: 'asc' }],
    });
  },

  /**
   * Find a template by ID
   */
  async findById(id: string) {
    return prisma.taskTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    });
  },

  /**
   * Delete a template
   */
  async delete(id: string) {
    return prisma.taskTemplate.delete({
      where: { id },
    });
  },

  /**
   * Update a template
   */
  async update(id: string, data: Partial<Omit<CreateTemplateData, 'creatorId'>>) {
    return prisma.taskTemplate.update({
      where: { id },
      data,
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    });
  },
};
