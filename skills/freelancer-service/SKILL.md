---
name: freelancer-service
description: Freelancer service tools for managing resumes, services, transactions, and talent matching.
metadata:
  mcp:
    server: uxin-mcp
tools:
  - name: resume_create
    description: Create or update freelancer resume. Requires freelancer_id, title, skills, experience, education.
    parameters:
      freelancer_id: string
      title: string
      summary: string?
      skills: string[]
      experience: any[]?
      education: any[]?
      hourly_rate: number?
      availability: string?
      portfolio_links: string[]?
      certifications: string[]?
  - name: freelancer_register
    description: Register freelancer. Requires name, email, phone, country.
    parameters:
      name: string
      email: string
      phone: string?
      country: string
      timezone: string?
      preferred_languages: string[]?
      payment_methods: string[]?
      tax_id: string?
      verification_documents: string[]?
  - name: service_create
    description: Create freelancer service. Requires freelancer_id, title, description, category, price_type.
    parameters:
      freelancer_id: string
      title: string
      description: string
      category: string?
      price_type: string
      price: number?
      delivery_time: string?
      revisions: number?
      requirements: string[]?
      tags: string[]?
  - name: transaction_create
    description: Create service transaction. Requires client_id, freelancer_id, service_id, amount.
    parameters:
      client_id: string
      freelancer_id: string
      service_id: string
      amount: number
      currency: string?
      description: string?
      terms: string?
      milestones: any[]?
      start_date: string?
      end_date: string?
  - name: contract_create
    description: Create or update contract. Requires transaction_id, terms.
    parameters:
      transaction_id: string
      terms: string
      signatures: string[]?
      attachments: string[]?
  - name: talent_match
    description: Match talent based on skills, budget, and duration.
    parameters:
      skills: string[]
      budget: number?
      duration: string?
  - name: skill_analyzer
    description: Analyze project description to extract required skills.
    parameters:
      project_description: string
      industry: string?
  - name: marketplace_integrator
    description: Integrate with external marketplaces.
    parameters:
      query: string
      platforms: string[]?
      filters: any?
  - name: compliance_checker
    description: Check contract compliance.
    parameters:
      contract_terms: string
      region: string?
      compliance_type: string[]?
  - name: growth_strategy_analyzer
    description: Analyze growth strategy.
    parameters:
      goal: string
      metrics: any?
      platform: string?
  - name: ux_design_reviewer
    description: Review UX design.
    parameters:
      prototype_link: string
      user_persona: string?
      focus_areas: string[]?
  - name: devops_pipeline_optimizer
    description: Optimize DevOps pipeline.
    parameters:
      current_stack: string[]?
      deployment_frequency: string?
      automation_level: number?
---

# Freelancer Service

Provides tools for managing freelancer profiles, services, transactions, and matching talent to projects.
