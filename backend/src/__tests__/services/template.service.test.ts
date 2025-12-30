/**
 * Unit tests for Template Service
 * Tests template CRUD and access control
 */

// Mock repository before imports
jest.mock('../../repositories/template.repository', () => ({
  templateRepository: {
    findAllForUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { templateService } from '../../services/template.service';
import { templateRepository } from '../../repositories/template.repository';
import { AppError } from '../../lib/errors';

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTemplate = {
    id: 'template-1',
    name: 'Bug Report',
    title: 'Bug: ',
    description: 'Describe the bug...',
    priority: 'HIGH',
    isGlobal: false,
    creatorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('getTemplates', () => {
    /**
     * Test 1: Return all templates for user
     */
    it('should return all templates available to user', async () => {
      const templates = [mockTemplate, { ...mockTemplate, id: 'template-2' }];
      (templateRepository.findAllForUser as jest.Mock).mockResolvedValue(templates);

      const result = await templateService.getTemplates('user-1');

      expect(result).toEqual(templates);
      expect(templateRepository.findAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getTemplateById', () => {
    /**
     * Test 2: Return template when user is creator
     */
    it('should return template when user is creator', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await templateService.getTemplateById('template-1', 'user-1');

      expect(result).toEqual(mockTemplate);
    });

    /**
     * Test 3: Return global template to any user
     */
    it('should return global template to any user', async () => {
      const globalTemplate = { ...mockTemplate, isGlobal: true };
      (templateRepository.findById as jest.Mock).mockResolvedValue(globalTemplate);

      const result = await templateService.getTemplateById('template-1', 'other-user');

      expect(result).toEqual(globalTemplate);
    });

    /**
     * Test 4: Throw 403 when accessing private template
     */
    it('should throw 403 when accessing private template not owned by user', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);

      await expect(templateService.getTemplateById('template-1', 'other-user')).rejects.toThrow(
        AppError
      );
    });

    /**
     * Test 5: Throw 404 when template not found
     */
    it('should throw 404 when template does not exist', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(templateService.getTemplateById('non-existent', 'user-1')).rejects.toThrow(
        AppError
      );
    });
  });

  describe('createTemplate', () => {
    /**
     * Test 6: Create template successfully
     */
    it('should create a new template', async () => {
      (templateRepository.create as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await templateService.createTemplate(
        {
          name: 'Bug Report',
          title: 'Bug: ',
          description: 'Describe the bug...',
          priority: 'HIGH',
        },
        'user-1'
      );

      expect(result).toEqual(mockTemplate);
      expect(templateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bug Report',
          creatorId: 'user-1',
        })
      );
    });

    /**
     * Test 7: Create template with isGlobal flag
     */
    it('should create global template when isGlobal is true', async () => {
      (templateRepository.create as jest.Mock).mockResolvedValue({
        ...mockTemplate,
        isGlobal: true,
      });

      await templateService.createTemplate(
        {
          name: 'Global Template',
          title: 'Test',
          description: 'Test',
          priority: 'MEDIUM',
          isGlobal: true,
        },
        'user-1'
      );

      expect(templateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isGlobal: true,
        })
      );
    });
  });

  describe('deleteTemplate', () => {
    /**
     * Test 8: Delete template by creator
     */
    it('should delete template when user is creator', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);
      (templateRepository.delete as jest.Mock).mockResolvedValue({});

      const result = await templateService.deleteTemplate('template-1', 'user-1');

      expect(result.success).toBe(true);
      expect(templateRepository.delete).toHaveBeenCalledWith('template-1');
    });

    /**
     * Test 9: Throw 403 when non-creator tries to delete
     */
    it('should throw 403 when non-creator tries to delete', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);

      await expect(templateService.deleteTemplate('template-1', 'other-user')).rejects.toThrow(
        AppError
      );
    });

    /**
     * Test 10: Throw 404 when template not found
     */
    it('should throw 404 when template does not exist', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(templateService.deleteTemplate('non-existent', 'user-1')).rejects.toThrow(
        AppError
      );
    });
  });

  describe('updateTemplate', () => {
    /**
     * Test 11: Update template by creator
     */
    it('should update template when user is creator', async () => {
      const updatedTemplate = { ...mockTemplate, name: 'Updated Name' };
      (templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);
      (templateRepository.update as jest.Mock).mockResolvedValue(updatedTemplate);

      const result = await templateService.updateTemplate(
        'template-1',
        { name: 'Updated Name' },
        'user-1'
      );

      expect(result.name).toBe('Updated Name');
    });

    /**
     * Test 12: Throw 403 when non-creator tries to update
     */
    it('should throw 403 when non-creator tries to update', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);

      await expect(
        templateService.updateTemplate('template-1', { name: 'Hacked' }, 'other-user')
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 13: Throw 404 when template not found
     */
    it('should throw 404 when template does not exist', async () => {
      (templateRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        templateService.updateTemplate('non-existent', { name: 'Test' }, 'user-1')
      ).rejects.toThrow(AppError);
    });
  });
});
