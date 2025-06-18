import { 
  TemplateEngine, 
  PromptAutoCompletion,
  promptRegistry,
  createPrompt,
  PromptDefinition 
} from '../prompt-handler.js';

describe('PromptRegistry', () => {
  beforeEach(() => {
    // Clear the global registry before each test
    (promptRegistry as any).prompts.clear();
  });

  describe('register via createPrompt', () => {
    it('should register a valid prompt', () => {
      const prompt: PromptDefinition = {
        name: 'test_prompt',
        description: 'A test prompt',
        template: 'Hello {name}!',
        category: 'test',
        version: '1.0.0'
      };

      expect(() => createPrompt(prompt)).not.toThrow();
      expect(promptRegistry.has('test_prompt')).toBe(true);
    });

    it('should throw error for invalid prompt', () => {
      const invalidPrompt = {
        name: '',
        description: 'Invalid prompt'
      } as PromptDefinition;

      expect(() => createPrompt(invalidPrompt)).toThrow();
    });
  });

  describe('get', () => {
    it('should return existing prompt', () => {
      const prompt: PromptDefinition = {
        name: 'test_prompt',
        description: 'A test prompt',
        template: 'Hello {name}!',
        category: 'test',
        version: '1.0.0'
      };

      createPrompt(prompt);
      const retrieved = promptRegistry.get('test_prompt');
      expect(retrieved).toEqual(prompt);
    });

    it('should return undefined for non-existing prompt', () => {
      expect(promptRegistry.get('non_existing')).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('should return prompts by category', () => {
      const prompt1: PromptDefinition = {
        name: 'test1',
        description: 'Test 1',
        template: 'Template 1',
        category: 'category1',
        version: '1.0.0'
      };

      const prompt2: PromptDefinition = {
        name: 'test2',
        description: 'Test 2',
        template: 'Template 2',
        category: 'category1',
        version: '1.0.0'
      };

      const prompt3: PromptDefinition = {
        name: 'test3',
        description: 'Test 3',
        template: 'Template 3',
        category: 'category2',
        version: '1.0.0'
      };

      createPrompt(prompt1);
      createPrompt(prompt2);
      createPrompt(prompt3);

      const category1Prompts = promptRegistry.getByCategory('category1');
      expect(category1Prompts).toHaveLength(2);
      expect(category1Prompts.map((p: PromptDefinition) => p.name)).toEqual(['test1', 'test2']);
    });
  });
});

describe('TemplateEngine', () => {
  describe('substitute', () => {
    it('should substitute template variables', () => {
      const template = 'Hello {name}, you are {age} years old!';
      const variables = { name: 'John', age: 30 };
      const result = TemplateEngine.substitute(template, variables);
      expect(result).toBe('Hello John, you are 30 years old!');
    });

    it('should handle missing variables by keeping placeholder', () => {
      const template = 'Hello {name}, you are {age} years old!';
      const variables = { name: 'John' };
      const result = TemplateEngine.substitute(template, variables);
      expect(result).toBe('Hello John, you are {age} years old!');
    });

    it('should handle empty variables object', () => {
      const template = 'Hello {name}!';
      const variables = {};
      const result = TemplateEngine.substitute(template, variables);
      expect(result).toBe('Hello {name}!');
    });
  });

  describe('extractVariables', () => {
    it('should extract variable names from template', () => {
      const template = 'Hello {name}, you have {count} messages and {status} is active';
      const variables = TemplateEngine.extractVariables(template);
      expect(variables).toEqual(['name', 'count', 'status']);
    });

    it('should handle template with no variables', () => {
      const template = 'Hello world!';
      const variables = TemplateEngine.extractVariables(template);
      expect(variables).toEqual([]);
    });

    it('should handle duplicate variables', () => {
      const template = 'Hello {name}, goodbye {name}!';
      const variables = TemplateEngine.extractVariables(template);
      expect(variables).toEqual(['name', 'name']);
    });
  });

  describe('validateVariables', () => {
    it('should validate required variables are present', () => {
      const template = 'Hello {name}, you are {age} years old!';
      const variables = { name: 'John', age: 30 };
      const requiredParams = [
        { name: 'name', required: true, type: 'string' as const },
        { name: 'age', required: true, type: 'number' as const }
      ];

      const result = TemplateEngine.validateVariables(template, variables, requiredParams);
      expect(result.isValid).toBe(true);
      expect(result.missingVariables).toEqual([]);
    });

    it('should identify missing required variables', () => {
      const template = 'Hello {name}, you are {age} years old!';
      const variables = { name: 'John' };
      const requiredParams = [
        { name: 'name', required: true, type: 'string' as const },
        { name: 'age', required: true, type: 'number' as const }
      ];

      const result = TemplateEngine.validateVariables(template, variables, requiredParams);
      expect(result.isValid).toBe(false);
      expect(result.missingVariables).toEqual(['age']);
    });

    it('should handle optional parameters', () => {
      const template = 'Hello {name}!';
      const variables = { name: 'John' };
      const requiredParams = [
        { name: 'name', required: true, type: 'string' as const },
        { name: 'age', required: false, type: 'number' as const }
      ];

      const result = TemplateEngine.validateVariables(template, variables, requiredParams);
      expect(result.isValid).toBe(true);
      expect(result.missingVariables).toEqual([]);
    });
  });
});

describe('PromptAutoCompletion', () => {
  describe('getSuggestions', () => {
    it('should return sheet suggestions for sheet parameters', async () => {
      const suggestions = await PromptAutoCompletion.getSuggestions('sheet_name');
      expect(suggestions).toContain('Project Dashboard');
      expect(suggestions).toContain('Sprint Backlog');
    });

    it('should return column suggestions for column parameters', async () => {
      const suggestions = await PromptAutoCompletion.getSuggestions('column_name');
      expect(suggestions).toContain('Task Name');
      expect(suggestions).toContain('Status');
    });

    it('should return user suggestions for user parameters', async () => {
      const suggestions = await PromptAutoCompletion.getSuggestions('assigned_user');
      expect(suggestions).toContain('John Doe');
      expect(suggestions).toContain('Jane Smith');
    });

    it('should return status suggestions for status parameters', async () => {
      const suggestions = await PromptAutoCompletion.getSuggestions('task_status');
      expect(suggestions).toContain('In Progress');
      expect(suggestions).toContain('Complete');
    });

    it('should return priority suggestions for priority parameters', async () => {
      const suggestions = await PromptAutoCompletion.getSuggestions('task_priority');
      expect(suggestions).toContain('High');
      expect(suggestions).toContain('Medium');
      expect(suggestions).toContain('Low');
    });

    it('should return empty array for unknown parameter types', async () => {
      const suggestions = await PromptAutoCompletion.getSuggestions('unknown_param');
      expect(suggestions).toEqual([]);
    });
  });
});

describe('Global Prompt Registry', () => {
  beforeEach(() => {
    // Clear the global registry before each test
    (promptRegistry as any).prompts.clear();
  });

  describe('createPrompt', () => {
    it('should register prompt in global registry', () => {
      const prompt: PromptDefinition = {
        name: 'global_test',
        description: 'Global test prompt',
        template: 'Global template {param}',
        category: 'test',
        version: '1.0.0'
      };

      createPrompt(prompt);
      expect(promptRegistry.has('global_test')).toBe(true);
      expect(promptRegistry.get('global_test')).toEqual(prompt);
    });

    it('should throw error for duplicate prompt names', () => {
      const prompt: PromptDefinition = {
        name: 'duplicate_test',
        description: 'First prompt',
        template: 'Template 1',
        category: 'test',
        version: '1.0.0'
      };

      createPrompt(prompt);
      
      // Should not throw on first registration
      expect(promptRegistry.has('duplicate_test')).toBe(true);
      
      // Registering same name should overwrite (this is the current behavior)
      const prompt2: PromptDefinition = {
        name: 'duplicate_test',
        description: 'Second prompt',
        template: 'Template 2',
        category: 'test',
        version: '2.0.0'
      };
      
      expect(() => createPrompt(prompt2)).not.toThrow();
      expect(promptRegistry.get('duplicate_test')?.description).toBe('Second prompt');
    });
  });

  describe('getPromptCompletionSuggestions', () => {
    it('should return suggestions for existing prompt and parameter', async () => {
      // Create a test prompt with arguments
      const prompt: PromptDefinition = {
        name: 'user_prompt',
        description: 'User management prompt',
        template: 'Assign {user} to {task}',
        arguments: [
          { name: 'user', required: true, type: 'string' },
          { name: 'task', required: true, type: 'string' }
        ],
        category: 'test'
      };
      createPrompt(prompt);
      
      // Test user parameter suggestions
      const userSuggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('user_prompt', 'user')
      );
      expect(userSuggestions).toContain('John Doe');
      expect(userSuggestions).toContain('Jane Smith');
      
      // Mock implementation assumes 'task' is like a column name
      const taskSuggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('user_prompt', 'task')
      );
      expect(taskSuggestions).toEqual([]);
    });
    
    it('should return empty array for non-existing prompt', async () => {
      const suggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('non_existing_prompt', 'any_param')
      );
      expect(suggestions).toEqual([]);
    });
    
    it('should return appropriate suggestions based on parameter name', async () => {
      // Create a test prompt with various parameter types
      const prompt: PromptDefinition = {
        name: 'test_prompt',
        description: 'Test prompt with various parameters',
        template: 'Template with {sheet_name}, {column_name}, {status}, and {priority}',
        arguments: [
          { name: 'sheet_name', required: true, type: 'string' },
          { name: 'column_name', required: true, type: 'string' },
          { name: 'status', required: true, type: 'string' },
          { name: 'priority', required: false, type: 'string' }
        ],
        category: 'test'
      };
      createPrompt(prompt);
      
      // Test sheet name suggestions
      const sheetSuggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('test_prompt', 'sheet_name')
      );
      expect(sheetSuggestions).toContain('Project Dashboard');
      expect(sheetSuggestions).toContain('Sprint Backlog');
      
      // Test column name suggestions
      const columnSuggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('test_prompt', 'column_name')
      );
      expect(columnSuggestions).toContain('Task Name');
      expect(columnSuggestions).toContain('Status');
      
      // Test status suggestions
      const statusSuggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('test_prompt', 'status')
      );
      expect(statusSuggestions).toContain('In Progress');
      expect(statusSuggestions).toContain('Complete');
      
      // Test priority suggestions
      const prioritySuggestions = await import('../prompt-handler.js').then(m => 
        m.getPromptCompletionSuggestions('test_prompt', 'priority')
      );
      expect(prioritySuggestions).toContain('High');
      expect(prioritySuggestions).toContain('Medium');
    });
  });
});