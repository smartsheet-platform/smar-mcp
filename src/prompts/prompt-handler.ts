import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

/**
 * Prompt parameter schema for validation
 */
export const PromptParameterSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']).default('string')
});

/**
 * Prompt definition schema
 */
export const PromptDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  arguments: z.array(PromptParameterSchema).optional(),
  template: z.string(),
  category: z.string().default('general'),
  version: z.string().default('1.0.0')
});

export type PromptParameter = z.infer<typeof PromptParameterSchema>;
export type PromptDefinition = z.infer<typeof PromptDefinitionSchema>;

/**
 * Prompt registry to store all available prompts
 */
class PromptRegistry {
  private prompts: Map<string, PromptDefinition> = new Map();

  /**
   * Register a new prompt
   */
  register(prompt: PromptDefinition): void {
    // Validate prompt definition
    PromptDefinitionSchema.parse(prompt);
    if (this.prompts.has(prompt.name)) {
      throw new Error(`A prompt with the name "${prompt.name}" is already registered.`);
    }
    this.prompts.set(prompt.name, prompt);
  }

  /**
   * Get all registered prompts
   */
  getAll(): PromptDefinition[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Get a specific prompt by name
   */
  get(name: string): PromptDefinition | undefined {
    return this.prompts.get(name);
  }

  /**
   * Check if a prompt exists
   */
  has(name: string): boolean {
    return this.prompts.has(name);
  }

  /**
   * Get prompts by category
   */
  getByCategory(category: string): PromptDefinition[] {
    return Array.from(this.prompts.values()).filter(p => p.category === category);
  }
}

// Global prompt registry instance
export const promptRegistry = new PromptRegistry();

/**
 * Template variable substitution utility
 */
export class TemplateEngine {
  /**
   * Replace template variables with actual values
   * Supports {variable_name} syntax
   */
  static substitute(template: string, variables: Record<string, any>): string {
    return template.replace(/\{([^}]+)\}/g, (match, variableName) => {
      const value = variables[variableName.trim()];
      if (value === undefined || value === null) {
        return match; // Keep original placeholder if variable not found
      }
      return String(value);
    });
  }

  /**
   * Extract variable names from template
   */
  static extractVariables(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map(match => match.slice(1, -1).trim());
  }

  /**
   * Validate that all required variables are provided
   */
  static validateVariables(
    template: string, 
    variables: Record<string, any>, 
    requiredParams: PromptParameter[] = []
  ): { isValid: boolean; missingVariables: string[] } {
    const requiredVars = requiredParams.filter(p => p.required).map(p => p.name);
    
    const missingVariables = requiredVars.filter(varName => 
      variables[varName] === undefined || variables[varName] === null
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }
}

/**
 * Auto-completion provider for prompt parameters
 */
export class PromptAutoCompletion {
  /**
   * Get auto-completion suggestions for sheet names
   * In a real implementation, this would query the Smartsheet API
   */
  static async getSheetNameSuggestions(): Promise<string[]> {
    // Placeholder - would integrate with SmartsheetAPI
    return ['Project Dashboard', 'Sprint Backlog', 'Team Resources', 'Bug Tracker'];
  }

  /**
   * Get auto-completion suggestions for column names
   */
  static async getColumnNameSuggestions(_sheetId?: string): Promise<string[]> {
    // Placeholder - would integrate with SmartsheetAPI
    return ['Task Name', 'Assigned To', 'Status', 'Due Date', 'Priority', 'Story Points'];
  }

  /**
   * Get auto-completion suggestions for user names
   */
  static async getUserNameSuggestions(): Promise<string[]> {
    // Placeholder - would integrate with SmartsheetAPI
    return ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
  }

  /**
   * Get contextual suggestions based on parameter type
   */
  static async getSuggestions(parameterName: string, _parameterType?: string): Promise<string[]> {
    const normalizedName = parameterName.toLowerCase();
    
    if (normalizedName.includes('sheet')) {
      return this.getSheetNameSuggestions();
    } else if (normalizedName.includes('column')) {
      return this.getColumnNameSuggestions();
    } else if (normalizedName.includes('user') || normalizedName.includes('assignee') || normalizedName.includes('owner')) {
      return this.getUserNameSuggestions();
    } else if (normalizedName.includes('status')) {
      return ['Not Started', 'In Progress', 'Complete', 'On Hold', 'Blocked'];
    } else if (normalizedName.includes('priority')) {
      return ['High', 'Medium', 'Low', 'Critical'];
    }
    
    return [];
  }
}

/**
 * Register individual prompt with the MCP server using a simpler approach
 */
export function registerPrompt(server: McpServer, promptDef: PromptDefinition): void {
  server.prompt(
    promptDef.name,
    promptDef.description,
    async (args: Record<string, any>) => {
      console.info(`Executing prompt: ${promptDef.name}`);
      
      // Validate provided arguments
      const validation = TemplateEngine.validateVariables(
        promptDef.template, 
        args, 
        promptDef.arguments
      );

      if (!validation.isValid) {
        throw new Error(
          `Missing required parameters: ${validation.missingVariables.join(', ')}`
        );
      }

      // Substitute variables in template
      const processedTemplate = TemplateEngine.substitute(promptDef.template, args);

      // Create prompt messages
      const messages: PromptMessage[] = [
        {
          role: "user",
          content: {
            type: "text",
            text: processedTemplate
          }
        }
      ];

      return {
        description: promptDef.description,
        messages
      };
    }
  );
}

/**
 * Register all prompts from the registry with the MCP server
 */
export function registerPromptHandlers(server: McpServer): void {
  const prompts = promptRegistry.getAll();
  
  for (const prompt of prompts) {
    registerPrompt(server, prompt);
  }
  
  console.info(`✅ Registered ${prompts.length} prompts with MCP server`);
}

/**
 * Utility function to create and register a prompt with the global registry
 * 
 * @param definition - The prompt definition to register
 * @throws Will throw an error if the definition fails schema validation
 */
export function createPrompt(definition: PromptDefinition): void {
  promptRegistry.register(definition);
}

/**
 * Utility function to get prompt completion suggestions for a specific prompt parameter
 * 
 * Retrieves contextual auto-completion suggestions for a specific parameter
 * of a registered prompt. The suggestions are determined by analyzing the parameter
 * name and type to provide relevant options.
 * 
 * @param promptName - The name of the prompt to get suggestions for
 * @param parameterName - The specific parameter to get suggestions for
 * @returns Promise<string[]> - Array of suggestion strings for the parameter
 * @returns Empty array if prompt doesn't exist or no suggestions are available
 */
export async function getPromptCompletionSuggestions(
  promptName: string, 
  parameterName: string
): Promise<string[]> {
  const prompt = promptRegistry.get(promptName);
  if (!prompt) return [];

  const parameter = prompt.arguments?.find((p: PromptParameter) => p.name === parameterName);
  return PromptAutoCompletion.getSuggestions(parameterName, parameter?.type);
}