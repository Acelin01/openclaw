---
name: project-collaboration
description: Project collaboration tools for creating projects, tasks, milestones, and managing requirements.
metadata:
  mcp:
    server: uxin-mcp
tools:
  - name: project_create
    description: Create new project. Requires name, description, owner_id, start_date, end_date, budget.
    parameters:
      name: string
      description: string?
      owner_id: string
      start_date: string?
      end_date: string?
      budget: number?
      team_members: string[]?
  - name: milestone_create
    description: Create project milestone. Requires project_id, title, due_date, description.
    parameters:
      project_id: string
      title: string
      due_date: string
      description: string?
      dependencies: string[]?
  - name: requirement_create
    description: Create project requirement. Requires project_id, title, description, priority, status, assignee_id.
    parameters:
      project_id: string
      title: string
      description: string?
      priority: string?
      status: string?
      assignee_id: string?
      estimated_hours: number?
      acceptance_criteria: string[]?
  - name: task_create
    description: Create task. Requires project_id, title, description, assignee_id, estimated_hours, priority.
    parameters:
      project_id: string
      requirement_id: string?
      title: string
      description: string?
      assignee_id: string
      estimated_hours: number?
      priority: string?
      due_date: string?
      dependencies: string[]?
  - name: task_update_status
    description: Update task status. Requires task_id, status (pending, in_progress, completed, failed).
    parameters:
      task_id: string
      status: string
  - name: collaboration_dispatch
    description: Agent collaboration dispatch. Assign tasks to specific agent roles and establish dependencies.
    parameters:
      task_id: string
      agent_role: string
      context: string
      dependencies: string[]?
  - name: milestone_monitor
    description: Monitor project milestone status. Get progress, due dates, and risk status for all milestones.
    parameters:
      project_id: string
---

# Project Collaboration

Provides comprehensive project management capabilities including creating projects, managing milestones, tracking requirements, and dispatching tasks to agents.
