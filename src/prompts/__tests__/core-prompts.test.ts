import { 
  createProjectPlanPrompt,
  generateSprintReportPrompt,
  optimizeTaskAssignmentPrompt,
  analyzeProjectRisksPrompt,
  optimizeDevWorkflowPrompt,
  registerCorePrompts
} from '../core-prompts.js';
import { promptRegistry, TemplateEngine } from '../prompt-handler.js';

describe('Core Prompts', () => {
  beforeEach(() => {
    // Clear the global registry before each test
    (promptRegistry as any).prompts.clear();
  });

  describe('registerCorePrompts', () => {
    it('should register all 5 core prompts', () => {
      registerCorePrompts();
      
      expect(promptRegistry.has('create_project_plan')).toBe(true);
      expect(promptRegistry.has('generate_sprint_report')).toBe(true);
      expect(promptRegistry.has('optimize_task_assignment')).toBe(true);
      expect(promptRegistry.has('analyze_project_risks')).toBe(true);
      expect(promptRegistry.has('optimize_dev_workflow')).toBe(true);
      
      const allPrompts = promptRegistry.getAll();
      expect(allPrompts).toHaveLength(5);
    });
  });

  describe('createProjectPlanPrompt', () => {
    it('should have correct basic properties', () => {
      expect(createProjectPlanPrompt.name).toBe('create_project_plan');
      expect(createProjectPlanPrompt.description).toContain('structured project breakdowns');
      expect(createProjectPlanPrompt.category).toBe('project_management');
      expect(createProjectPlanPrompt.version).toBe('1.0.0');
    });

    it('should have required arguments', () => {
      const args = createProjectPlanPrompt.arguments || [];
      const requiredArgs = args.filter(arg => arg.required);
      
      expect(requiredArgs).toHaveLength(3);
      expect(requiredArgs.map(arg => arg.name)).toEqual([
        'project_description',
        'timeline', 
        'team_size'
      ]);
    });

    it('should have optional arguments', () => {
      const args = createProjectPlanPrompt.arguments || [];
      const optionalArgs = args.filter(arg => !arg.required);
      
      expect(optionalArgs.map(arg => arg.name)).toEqual([
        'budget_constraints',
        'technology_stack'
      ]);
    });

    it('should substitute template variables correctly', () => {
      const variables = {
        project_description: 'E-commerce website',
        timeline: '3 months',
        team_size: 5,
        budget_constraints: '$50,000',
        technology_stack: 'React, Node.js'
      };

      const result = TemplateEngine.substitute(createProjectPlanPrompt.template, variables);
      
      expect(result).toContain('E-commerce website');
      expect(result).toContain('3 months');
      expect(result).toContain('5');
      expect(result).toContain('$50,000');
      expect(result).toContain('React, Node.js');
    });
  });

  describe('generateSprintReportPrompt', () => {
    it('should have correct basic properties', () => {
      expect(generateSprintReportPrompt.name).toBe('generate_sprint_report');
      expect(generateSprintReportPrompt.description).toContain('sprint status summaries');
      expect(generateSprintReportPrompt.category).toBe('agile_management');
    });

    it('should require sheet_data and sprint_length', () => {
      const args = generateSprintReportPrompt.arguments || [];
      const requiredArgs = args.filter(arg => arg.required);
      
      expect(requiredArgs.map(arg => arg.name)).toEqual([
        'sheet_data',
        'sprint_length'
      ]);
    });

    it('should handle object type for sheet_data', () => {
      const args = generateSprintReportPrompt.arguments || [];
      const sheetDataArg = args.find(arg => arg.name === 'sheet_data');
      
      expect(sheetDataArg?.type).toBe('object');
      expect(sheetDataArg?.required).toBe(true);
    });
  });

  describe('optimizeTaskAssignmentPrompt', () => {
    it('should have correct basic properties', () => {
      expect(optimizeTaskAssignmentPrompt.name).toBe('optimize_task_assignment');
      expect(optimizeTaskAssignmentPrompt.description).toContain('resource allocation');
      expect(optimizeTaskAssignmentPrompt.category).toBe('resource_management');
    });

    it('should require team and task data', () => {
      const args = optimizeTaskAssignmentPrompt.arguments || [];
      const requiredArgs = args.filter(arg => arg.required);
      
      expect(requiredArgs.map(arg => arg.name)).toEqual([
        'team_members',
        'task_list',
        'skills_data',
        'workload_data'
      ]);
    });

    it('should handle array and object types correctly', () => {
      const args = optimizeTaskAssignmentPrompt.arguments || [];
      
      const teamMembersArg = args.find(arg => arg.name === 'team_members');
      expect(teamMembersArg?.type).toBe('array');
      
      const skillsDataArg = args.find(arg => arg.name === 'skills_data');
      expect(skillsDataArg?.type).toBe('object');
    });
  });

  describe('analyzeProjectRisksPrompt', () => {
    it('should have correct basic properties', () => {
      expect(analyzeProjectRisksPrompt.name).toBe('analyze_project_risks');
      expect(analyzeProjectRisksPrompt.description).toContain('risk identification');
      expect(analyzeProjectRisksPrompt.category).toBe('risk_management');
    });

    it('should require core project information', () => {
      const args = analyzeProjectRisksPrompt.arguments || [];
      const requiredArgs = args.filter(arg => arg.required);
      
      expect(requiredArgs.map(arg => arg.name)).toEqual([
        'project_scope',
        'current_progress',
        'team_info',
        'project_timeline'
      ]);
    });

    it('should have optional budget and stakeholder info', () => {
      const args = analyzeProjectRisksPrompt.arguments || [];
      const optionalArgs = args.filter(arg => !arg.required);
      
      expect(optionalArgs.map(arg => arg.name)).toEqual([
        'budget_info',
        'stakeholder_info'
      ]);
    });
  });

  describe('optimizeDevWorkflowPrompt', () => {
    it('should have correct basic properties', () => {
      expect(optimizeDevWorkflowPrompt.name).toBe('optimize_dev_workflow');
      expect(optimizeDevWorkflowPrompt.description).toContain('Process improvement');
      expect(optimizeDevWorkflowPrompt.category).toBe('process_optimization');
    });

    it('should require workflow analysis data', () => {
      const args = optimizeDevWorkflowPrompt.arguments || [];
      const requiredArgs = args.filter(arg => arg.required);
      
      expect(requiredArgs.map(arg => arg.name)).toEqual([
        'workflow_metrics',
        'dev_practices',
        'tool_stack',
        'bottleneck_data'
      ]);
    });

    it('should have optional team feedback and targets', () => {
      const args = optimizeDevWorkflowPrompt.arguments || [];
      const optionalArgs = args.filter(arg => !arg.required);
      
      expect(optionalArgs.map(arg => arg.name)).toEqual([
        'team_feedback',
        'delivery_targets'
      ]);
    });
  });

  describe('Template Variable Extraction', () => {
    it('should extract all variables from create_project_plan template', () => {
      const variables = TemplateEngine.extractVariables(createProjectPlanPrompt.template);
      
      expect(variables).toContain('project_description');
      expect(variables).toContain('timeline');
      expect(variables).toContain('team_size');
      expect(variables).toContain('budget_constraints');
      expect(variables).toContain('technology_stack');
    });

    it('should extract all variables from generate_sprint_report template', () => {
      const variables = TemplateEngine.extractVariables(generateSprintReportPrompt.template);
      
      expect(variables).toContain('sheet_data');
      expect(variables).toContain('sprint_length');
      expect(variables).toContain('sprint_goal');
      expect(variables).toContain('previous_velocity');
    });

    it('should extract all variables from optimize_task_assignment template', () => {
      const variables = TemplateEngine.extractVariables(optimizeTaskAssignmentPrompt.template);
      
      expect(variables).toContain('team_members');
      expect(variables).toContain('task_list');
      expect(variables).toContain('skills_data');
      expect(variables).toContain('workload_data');
      expect(variables).toContain('project_deadline');
    });
  });

  describe('Template Validation', () => {
    it('should validate create_project_plan with all required variables', () => {
      const variables = {
        project_description: 'Test project',
        timeline: '2 months',
        team_size: 3,
        budget_constraints: 'N/A',  // Include optional parameters that are in template
        technology_stack: 'React'
      };

      const validation = TemplateEngine.validateVariables(
        createProjectPlanPrompt.template,
        variables,
        createProjectPlanPrompt.arguments
      );

      expect(validation.isValid).toBe(true);
      expect(validation.missingVariables).toEqual([]);
    });

    it('should identify missing required variables', () => {
      const variables = {
        project_description: 'Test project'
        // Missing timeline and team_size
      };

      const validation = TemplateEngine.validateVariables(
        createProjectPlanPrompt.template,
        variables,
        createProjectPlanPrompt.arguments
      );

      expect(validation.isValid).toBe(false);
      expect(validation.missingVariables).toContain('timeline');
      expect(validation.missingVariables).toContain('team_size');
    });
  });

  describe('Prompt Categories', () => {
    beforeEach(() => {
      registerCorePrompts();
    });

    it('should organize prompts by categories', () => {
      const projectMgmtPrompts = promptRegistry.getByCategory('project_management');
      expect(projectMgmtPrompts).toHaveLength(1);
      expect(projectMgmtPrompts[0].name).toBe('create_project_plan');

      const agileMgmtPrompts = promptRegistry.getByCategory('agile_management');
      expect(agileMgmtPrompts).toHaveLength(1);
      expect(agileMgmtPrompts[0].name).toBe('generate_sprint_report');

      const resourceMgmtPrompts = promptRegistry.getByCategory('resource_management');
      expect(resourceMgmtPrompts).toHaveLength(1);
      expect(resourceMgmtPrompts[0].name).toBe('optimize_task_assignment');

      const riskMgmtPrompts = promptRegistry.getByCategory('risk_management');
      expect(riskMgmtPrompts).toHaveLength(1);
      expect(riskMgmtPrompts[0].name).toBe('analyze_project_risks');

      const processOptPrompts = promptRegistry.getByCategory('process_optimization');
      expect(processOptPrompts).toHaveLength(1);
      expect(processOptPrompts[0].name).toBe('optimize_dev_workflow');
    });
  });
});