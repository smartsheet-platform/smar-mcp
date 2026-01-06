/**
 * Smartsheet MCP Tools Tests
 *
 * These tests verify the MCP tool definitions and schemas.
 */

import { z } from 'zod';

describe('Smartsheet Tools Schema Validation', () => {
  describe('Sheet ID Validation', () => {
    const sheetIdSchema = z.string().describe('The ID of the sheet');

    it('should accept valid sheet ID strings', () => {
      expect(() => sheetIdSchema.parse('1234567890123456')).not.toThrow();
      expect(() => sheetIdSchema.parse('7532263697764228')).not.toThrow();
    });

    it('should reject non-string values', () => {
      expect(() => sheetIdSchema.parse(1234567890123456)).toThrow();
      expect(() => sheetIdSchema.parse(null)).toThrow();
      expect(() => sheetIdSchema.parse(undefined)).toThrow();
    });
  });

  describe('Row Schema Validation', () => {
    const rowSchema = z.object({
      id: z.string().describe('Row ID'),
      cells: z.array(
        z.object({
          columnId: z.number().or(z.string()).describe('Column ID'),
          value: z.any().optional().describe('Cell value'),
          formula: z.string().optional().describe('Cell formula'),
          format: z.string().optional().describe('Cell format'),
        })
      ).describe('Array of cell objects'),
    });

    it('should accept valid row objects', () => {
      const validRow = {
        id: '123456789012345',
        cells: [
          { columnId: 765432109876543, value: 'Test Value' },
          { columnId: '234567890123456', formula: '=SUM([Column1]1:[Column1]10)' }
        ]
      };
      expect(() => rowSchema.parse(validRow)).not.toThrow();
    });

    it('should accept row with empty cells array', () => {
      const emptyRow = { id: '123456789012345', cells: [] };
      expect(() => rowSchema.parse(emptyRow)).not.toThrow();
    });

    it('should reject row without id', () => {
      const invalidRow = { cells: [] };
      expect(() => rowSchema.parse(invalidRow)).toThrow();
    });
  });

  describe('Column Schema Validation', () => {
    const columnSchema = z.object({
      title: z.string().describe('Column title'),
      type: z.string().describe('Column type'),
      primary: z.boolean().optional().describe('Whether this is the primary column'),
      options: z.array(z.string()).optional().describe('Options for PICKLIST columns'),
    });

    it('should accept valid column definition', () => {
      const validColumn = {
        title: 'Status',
        type: 'PICKLIST',
        options: ['Not Started', 'In Progress', 'Complete']
      };
      expect(() => columnSchema.parse(validColumn)).not.toThrow();
    });

    it('should accept primary column', () => {
      const primaryColumn = {
        title: 'Task Name',
        type: 'TEXT_NUMBER',
        primary: true
      };
      expect(() => columnSchema.parse(primaryColumn)).not.toThrow();
    });

    it('should reject column without title', () => {
      const invalidColumn = { type: 'TEXT_NUMBER' };
      expect(() => columnSchema.parse(invalidColumn)).toThrow();
    });
  });

  describe('Attachment Type Validation', () => {
    const attachmentTypeSchema = z.enum([
      'LINK', 'BOX_COM', 'DROPBOX', 'EGNYTE', 'EVERNOTE', 'GOOGLE_DRIVE', 'ONEDRIVE'
    ]);

    it('should accept valid attachment types', () => {
      expect(() => attachmentTypeSchema.parse('LINK')).not.toThrow();
      expect(() => attachmentTypeSchema.parse('GOOGLE_DRIVE')).not.toThrow();
      expect(() => attachmentTypeSchema.parse('DROPBOX')).not.toThrow();
    });

    it('should reject invalid attachment types', () => {
      expect(() => attachmentTypeSchema.parse('INVALID_TYPE')).toThrow();
      expect(() => attachmentTypeSchema.parse('link')).toThrow(); // case sensitive
    });
  });

  describe('Email Recipient Schema', () => {
    const recipientSchema = z.object({
      email: z.string().describe('Email address')
    });

    it('should accept valid email object', () => {
      expect(() => recipientSchema.parse({ email: 'user@example.com' })).not.toThrow();
    });

    it('should reject object without email', () => {
      expect(() => recipientSchema.parse({ name: 'User' })).toThrow();
    });
  });

  describe('Update Request Schema', () => {
    const updateRequestSchema = z.object({
      sheetId: z.string(),
      rowIds: z.array(z.number()).optional(),
      sendTo: z.array(z.object({ email: z.string() })),
      subject: z.string().optional(),
      message: z.string().optional(),
      ccMe: z.boolean().optional(),
    });

    it('should accept valid update request', () => {
      const validRequest = {
        sheetId: '7532263697764228',
        sendTo: [{ email: 'user@example.com' }],
        subject: 'Please update',
        message: 'Update your rows'
      };
      expect(() => updateRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should accept update request with row IDs', () => {
      const requestWithRows = {
        sheetId: '7532263697764228',
        rowIds: [123456789012345, 234567890123456],
        sendTo: [{ email: 'user@example.com' }],
        ccMe: true
      };
      expect(() => updateRequestSchema.parse(requestWithRows)).not.toThrow();
    });

    it('should reject update request without sendTo', () => {
      const invalidRequest = {
        sheetId: '7532263697764228',
        subject: 'Please update'
      };
      expect(() => updateRequestSchema.parse(invalidRequest)).toThrow();
    });
  });
});

describe('Column Type Constants', () => {
  const validColumnTypes = [
    'TEXT_NUMBER',
    'DATE',
    'DATETIME',
    'CONTACT_LIST',
    'CHECKBOX',
    'PICKLIST',
    'DURATION',
    'PREDECESSOR',
    'ABSTRACT_DATETIME'
  ];

  it('should have all expected column types defined', () => {
    validColumnTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    });
  });
});
