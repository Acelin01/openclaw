---
name: pm-docs
description: Product Manager skills for creating PRDs and technical specs.
metadata: { "openclaw": { "emoji": "📝", "requires": { "bins": ["mkdir", "touch", "cat"] } } }
---

# Product Manager Documentation Skills

Use these commands to generate standard product documentation.

## Create PRD (Product Requirement Document)

Generate a new PRD from the standard template.

```bash
# Usage: create-prd <feature-name>
mkdir -p docs/prd
cat > docs/prd/FEATURE_NAME.md <<EOF
# PRD: FEATURE_NAME

## 1. Context & Problem Statement
* Why are we building this?
* Who is it for?

## 2. User Stories
* As a <role>, I want to <action>, so that <benefit>.

## 3. Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## 4. Technical Considerations
* API endpoints needed
* Database schema changes

## 5. Success Metrics
* KPI 1
* KPI 2
EOF
```

## Update PRD Status

Mark a section as completed or update requirements.

```bash
# Append a note to the PRD
echo "- [$(date)] Update: New requirement added" >> docs/prd/FEATURE_NAME.md
```

## List All PRDs

View existing documentation.

```bash
ls -R docs/prd
```
