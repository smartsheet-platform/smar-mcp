import { createPrompt, PromptDefinition } from "./prompt-handler.js";

/**
 * Core project management prompts for Smartsheet integration
 */

/**
 * 1. Create Project Plan Prompt
 */
const createProjectPlanPrompt: PromptDefinition = {
  name: "create_project_plan",
  description: "Generate structured project breakdowns with tasks, dependencies, and timelines for Smartsheet",
  category: "project_management",
  version: "1.0.0",
  arguments: [
    {
      name: "project_description",
      description: "Description of the project to be planned",
      required: true,
      type: "string"
    },
    {
      name: "timeline",
      description: "Project timeline (e.g., '3 months', '6 weeks')",
      required: true,
      type: "string"
    },
    {
      name: "team_size",
      description: "Number of team members available",
      required: true,
      type: "number"
    },
    {
      name: "budget_constraints",
      description: "Budget limitations or financial constraints",
      required: false,
      type: "string"
    },
    {
      name: "technology_stack",
      description: "Technologies or tools to be used in the project",
      required: false,
      type: "string"
    }
  ],
  template: `You are an experienced project manager helping a development team plan their project in Smartsheet.

Create a detailed project plan for: {project_description}
Timeline: {timeline}
Team size: {team_size}
Budget constraints: {budget_constraints}
Technology stack: {technology_stack}

Break down the project into:
- Major phases with estimated durations
- Key tasks for each phase  
- Dependencies between tasks
- Suggested Smartsheet column structure (Status, Owner, Start Date, End Date, Priority, Story Points)
- Risk mitigation strategies
- Resource allocation recommendations

Format as a structured task list ready for import into Smartsheet, including:
1. Phase breakdown with milestone dates
2. Individual tasks with effort estimates
3. Dependencies clearly marked
4. Suggested assignments based on team size
5. Critical path identification

Provide the output in a format that can be easily copied into Smartsheet rows.`
};

/**
 * 2. Generate Sprint Report Prompt
 */
const generateSprintReportPrompt: PromptDefinition = {
  name: "generate_sprint_report",
  description: "Create automated sprint status summaries with completion rates and blockers from Smartsheet data",
  category: "agile_management", 
  version: "1.0.0",
  arguments: [
    {
      name: "sheet_data",
      description: "Current Smartsheet data in JSON format",
      required: true,
      type: "object"
    },
    {
      name: "sprint_length",
      description: "Sprint duration (e.g., '2 weeks', '1 month')",
      required: true,
      type: "string"
    },
    {
      name: "sprint_goal",
      description: "The main goal or objective of the sprint",
      required: false,
      type: "string"
    },
    {
      name: "previous_velocity",
      description: "Team velocity from previous sprints",
      required: false,
      type: "number"
    }
  ],
  template: `You are a Scrum Master analyzing sprint progress from Smartsheet data.

Based on the current sheet data: {sheet_data}
Sprint duration: {sprint_length}
Sprint goal: {sprint_goal}
Previous team velocity: {previous_velocity}

Generate a comprehensive sprint report including:
- Executive Summary
  * Sprint completion percentage
  * Key achievements and deliverables
  * Major blockers and impediments
- Detailed Analysis
  * Completed vs planned tasks breakdown
  * Story points delivered vs committed
  * Team velocity comparison with previous sprints
  * Task status distribution (Not Started, In Progress, Complete, Blocked)
- Risk Assessment
  * Current blockers and their impact
  * At-risk deliverables
  * Dependencies that may affect timeline
- Recommendations
  * Actions for next sprint
  * Process improvements
  * Resource adjustments needed
- Key Metrics Dashboard
  * Burndown analysis
  * Team performance indicators
  * Quality metrics (if available)

Format as a professional stakeholder report with clear sections, actionable insights, and specific recommendations for the next sprint planning session.`
};

/**
 * 3. Optimize Task Assignment Prompt
 */
const optimizeTaskAssignmentPrompt: PromptDefinition = {
  name: "optimize_task_assignment",
  description: "AI-powered resource allocation based on skills, workload, and project requirements",
  category: "resource_management",
  version: "1.0.0",
  arguments: [
    {
      name: "team_members",
      description: "List of team members with their skills and roles",
      required: true,
      type: "array"
    },
    {
      name: "task_list",
      description: "Available tasks with requirements and priorities",
      required: true,
      type: "array"
    },
    {
      name: "skills_data",
      description: "Skill matrix mapping team members to technical skills",
      required: true,
      type: "object"
    },
    {
      name: "workload_data",
      description: "Current workload and availability for each team member",
      required: true,
      type: "object"
    },
    {
      name: "project_deadline",
      description: "Project or sprint deadline",
      required: false,
      type: "string"
    }
  ],
  template: `You are a technical project manager optimizing team workload in a development project.

Current team: {team_members}
Available tasks: {task_list}
Skill matrix: {skills_data}
Current workload: {workload_data}
Project deadline: {project_deadline}

Analyze and provide optimal task assignments considering:

**Skills & Experience Analysis:**
- Match task requirements to individual expertise levels
- Identify skill development opportunities
- Consider cross-training needs

**Workload Balance:**
- Current capacity and availability
- Avoid overallocation and burnout
- Distribute work evenly across team

**Project Optimization:**
- Task dependencies and critical path
- Priority alignment with business goals
- Parallel work opportunities

**Development Best Practices:**
- Code review assignments
- Pair programming opportunities
- Knowledge sharing sessions
- Mentoring junior developers

**Output Format:**
Provide Smartsheet-ready assignments with:
1. Task Name | Assigned Owner | Estimated Effort | Priority | Dependencies
2. Rationale for each assignment
3. Workload distribution summary
4. Risk mitigation for over/under-allocated resources
5. Recommendations for skill development
6. Suggested collaboration patterns

Include specific action items for immediate implementation and monitoring checkpoints.`
};

/**
 * 4. Analyze Project Risks Prompt
 */
const analyzeProjectRisksPrompt: PromptDefinition = {
  name: "analyze_project_risks",
  description: "Comprehensive risk identification and mitigation strategies for software development projects",
  category: "risk_management",
  version: "1.0.0",
  arguments: [
    {
      name: "project_scope",
      description: "Detailed project scope and requirements",
      required: true,
      type: "string"
    },
    {
      name: "current_progress",
      description: "Current project status and completed milestones",
      required: true,
      type: "object"
    },
    {
      name: "team_info",
      description: "Team composition, skills, and experience levels",
      required: true,
      type: "object"
    },
    {
      name: "project_timeline",
      description: "Project timeline with key milestones and deadlines",
      required: true,
      type: "string"
    },
    {
      name: "budget_info",
      description: "Budget constraints and resource limitations",
      required: false,
      type: "object"
    },
    {
      name: "stakeholder_info",
      description: "Key stakeholders and their expectations",
      required: false,
      type: "array"
    }
  ],
  template: `You are a senior technical project manager conducting comprehensive risk analysis for a software development project.

Project details: {project_scope}
Current status: {current_progress}
Team composition: {team_info}
Timeline: {project_timeline}
Budget information: {budget_info}
Stakeholders: {stakeholder_info}

Conduct a thorough risk analysis across all project dimensions:

**Technical Risks:**
- Architecture and design complexities
- Technology stack dependencies
- Integration challenges
- Performance and scalability concerns
- Security vulnerabilities
- Data migration and compatibility issues

**Resource Risks:**
- Team availability and skill gaps
- Key person dependencies
- Resource allocation conflicts
- Contractor/vendor reliability
- Knowledge transfer needs

**Timeline Risks:**
- Scope creep indicators
- External dependencies
- Approval process bottlenecks
- Testing and quality assurance time
- Deployment and go-live challenges

**Business Risks:**
- Stakeholder alignment issues
- Changing requirements
- Market conditions impact
- Competitive pressures
- Regulatory compliance

**Risk Assessment Format:**
For each identified risk:
1. Risk Description
2. Probability (High/Medium/Low)
3. Impact (High/Medium/Low)
4. Risk Score (Probability × Impact)
5. Early Warning Indicators
6. Mitigation Strategies
7. Contingency Plans
8. Owner/Responsible Party
9. Review Date

**Deliverables:**
1. Risk Register suitable for Smartsheet tracking
2. Risk Heat Map prioritization
3. Action plan with immediate next steps
4. Monitoring and review schedule
5. Escalation procedures

Focus on actionable mitigation strategies that can be implemented immediately.`
};

/**
 * 5. Optimize Development Workflow Prompt
 */
const optimizeDevWorkflowPrompt: PromptDefinition = {
  name: "optimize_dev_workflow",
  description: "Process improvement recommendations for development team efficiency and delivery speed",
  category: "process_optimization",
  version: "1.0.0",
  arguments: [
    {
      name: "workflow_metrics",
      description: "Current workflow performance data and metrics",
      required: true,
      type: "object"
    },
    {
      name: "dev_practices",
      description: "Current development practices and methodologies",
      required: true,
      type: "object"
    },
    {
      name: "tool_stack",
      description: "Development tools and technologies currently in use",
      required: true,
      type: "array"
    },
    {
      name: "bottleneck_data",
      description: "Identified bottlenecks and pain points in current process",
      required: true,
      type: "array"
    },
    {
      name: "team_feedback",
      description: "Team feedback on current processes and suggested improvements",
      required: false,
      type: "array"
    },
    {
      name: "delivery_targets",
      description: "Target delivery metrics and performance goals",
      required: false,
      type: "object"
    }
  ],
  template: `You are a DevOps engineer and project manager analyzing development workflow efficiency.

Current workflow data: {workflow_metrics}
Team practices: {dev_practices}
Tools in use: {tool_stack}
Recent bottlenecks: {bottleneck_data}
Team feedback: {team_feedback}
Delivery targets: {delivery_targets}

Analyze current state and provide comprehensive optimization recommendations:

**Current State Analysis:**
- Workflow efficiency assessment
- Bottleneck identification and impact
- Tool utilization effectiveness
- Team collaboration patterns
- Quality and delivery metrics

**Optimization Opportunities:**
- Automation potential (CI/CD, testing, deployment)
- Process streamlining recommendations
- Tool consolidation or upgrades
- Communication improvements
- Quality gate optimizations

**Smartsheet Integration:**
- Template customizations for better project tracking
- Automated reporting workflows
- Integration with development tools
- Dashboard configurations for stakeholder visibility
- Metric tracking and KPI monitoring

**Implementation Roadmap:**
Phase 1 (Week 1-2): Quick wins and immediate improvements
- Process adjustments requiring no tool changes
- Communication protocol updates
- Quick automation scripts

Phase 2 (Week 3-4): Tool and process enhancements
- Tool integrations and configurations
- Workflow template updates
- Training and adoption activities

Phase 3 (Month 2+): Advanced optimizations
- Complex automation implementations
- Advanced analytics and reporting
- Continuous improvement processes

**Deliverables:**
1. Current state assessment with metrics
2. Prioritized improvement recommendations
3. Implementation timeline with resource requirements
4. Risk assessment for proposed changes
5. Success metrics and monitoring plan
6. Smartsheet template updates and configurations

Focus on actionable recommendations that can show measurable improvement within 2 weeks, with specific attention to integrating improvements into existing Smartsheet workflows.`
};

/**
 * Register all core prompts
 */
export function registerCorePrompts(): void {
  createPrompt(createProjectPlanPrompt);
  createPrompt(generateSprintReportPrompt);
  createPrompt(optimizeTaskAssignmentPrompt);
  createPrompt(analyzeProjectRisksPrompt);
  createPrompt(optimizeDevWorkflowPrompt);
  
  console.info("✅ Registered 5 core project management prompts");
}

/**
 * Export individual prompts for testing
 */
export {
  createProjectPlanPrompt,
  generateSprintReportPrompt,
  optimizeTaskAssignmentPrompt,
  analyzeProjectRisksPrompt,
  optimizeDevWorkflowPrompt
};