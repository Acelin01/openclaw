---
name: agent-collaboration
description: Agent collaboration tools for planning and orchestrating multi-agent workflows.
metadata:
  mcp:
    server: uxin-mcp
tools:
  - name: agent_collaboration_plan
    description: Plan agent collaboration. Generate task breakdown and dependencies based on a goal.
    parameters:
      goal: string
      include_flowcharts: boolean?
  - name: agent_collaboration_start
    description: Start agent collaboration. Generate plan, create tasks, and dispatch to agents.
    parameters:
      project_id: string
      goal: string
      assignee_id: string?
      create_tasks: boolean?
      dispatch: boolean?
      context: string?
---

# Agent Collaboration

Provides tools for orchestrating multi-agent workflows, including planning and execution.
