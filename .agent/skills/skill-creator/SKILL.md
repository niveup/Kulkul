---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends AI capabilities with specialized knowledge, workflows, or tool integrations.
license: Complete terms in LICENSE.txt
---

# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend AI capabilities by providing
specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific
domains or tasks—they transform a general-purpose agent into a specialized agent
equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

1. Specialized workflows - Multi-step procedures for specific domains
2. Tool integrations - Instructions for working with specific file formats or APIs
3. Domain expertise - Company-specific knowledge, schemas, business logic
4. Bundled resources - Scripts, references, and assets for complex and repetitive tasks

## Core Principles

### Concise is Key
The context window is a public good. Skills share the context window with everything else needed: system prompt, conversation history, other Skills' metadata, and the actual user request.

**Default assumption: The AI is already very smart.** Only add context that isn't already known. Challenge each piece of information: "Is this explanation really needed?" and "Does this paragraph justify its token cost?"

Prefer concise examples over verbose explanations.

### Set Appropriate Degrees of Freedom
Match the level of specificity to the task's fragility and variability:

**High freedom (text-based instructions)**: Use when multiple approaches are valid, decisions depend on context, or heuristics guide the approach.

**Medium freedom (pseudocode or scripts with parameters)**: Use when a preferred pattern exists, some variation is acceptable, or configuration affects behavior.

**Low freedom (specific scripts, few parameters)**: Use when operations are fragile and error-prone, consistency is critical, or a specific sequence must be followed.

Think of it as exploring a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

### Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md (required)

Every SKILL.md consists of:

- **Frontmatter** (YAML): Contains `name` and `description` fields. These are the only fields read to determine when the skill gets used.
- **Body** (Markdown): Instructions and guidance for using the skill. Only loaded AFTER the skill triggers.

#### Bundled Resources (optional)

##### Scripts (`scripts/`)
Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

##### References (`references/`)
Documentation and reference material intended to be loaded as needed into context.

##### Assets (`assets/`)
Files not intended to be loaded into context, but rather used within the output produced.

#### What to Not Include in a Skill

A skill should only contain essential files that directly support its functionality. Do NOT create extraneous documentation like README.md, INSTALLATION_GUIDE.md, etc.

### Progressive Disclosure Design Principle

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed

## Skill Creation Process

Skill creation involves these steps:

1. Understand the skill with concrete examples
2. Plan reusable skill contents (scripts, references, assets)
3. Initialize the skill (run init_skill.py)
4. Edit the skill (implement resources and write SKILL.md)
5. Package the skill (run package_skill.py)
6. Iterate based on real usage

### Step 1: Understanding the Skill with Concrete Examples
To create an effective skill, clearly understand concrete examples of how the skill will be used.

### Step 2: Planning the Reusable Skill Contents
To turn concrete examples into an effective skill, analyze each example by:
1. Considering how to execute on the example from scratch
2. Identifying what scripts, references, and assets would be helpful when executing these workflows repeatedly

### Step 3: Initializing the Skill
When creating a new skill from scratch, always run the `init_skill.py` script:

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

### Step 4: Edit the Skill
When editing the skill, remember that the skill is being created for another AI instance to use.

#### Update SKILL.md

**Writing Guidelines:** Always use imperative/infinitive form.

##### Frontmatter
Write the YAML frontmatter with `name` and `description`:
- `name`: The skill name
- `description`: This is the primary triggering mechanism for your skill

##### Body
Write instructions for using the skill and its bundled resources.

### Step 5: Packaging a Skill
Once development of the skill is complete, it must be packaged into a distributable .skill file:

```bash
scripts/package_skill.py <path/to/skill-folder>
```

### Step 6: Iterate
After testing the skill, users may request improvements.

**Iteration workflow:**
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or bundled resources should be updated
4. Implement changes and test again
