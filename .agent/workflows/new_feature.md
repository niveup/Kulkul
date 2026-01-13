---
description: Enterprise-grade engineering workflow. detailed architectural planning, performance-first implementation, and strict stability guarantees.
---

# Enterprise-Grade Feature Workflow

This workflow forces the AI to adopt the mindset of a **Principal Software Architect at a Billion-Dollar Tech Company** (e.g., Google, Netflix). It prioritizes long-term maintainability, zero-latency performance, and robust scalability over quick fixes.

## Phase 1: Deep Analysis & "One-Pager" Strategy
**Role**: Senior Principal Architect
**Goal**: Measure twice, cut once.

1. **Context & Impact Audit**:
   - Analyze the request: identifying not just *what* is asked, but *why*.
   - **Constraint Check**: Does this change affect existing state management? Will it introduce re-renders?
   - **Scalability Check**: Will this implementation survive 1,000,000 users or 10,000 items? (e.g., If a list is involved, **Virtualization is MANDATORY**).

2. **Architectural Blueprint** (Create `implementation_plan.md`):
   - **The "Why"**: Brief executive summary of the technical approach.
   - **Component Architecture**: Diagram (mermaid) or list showing data flow (Props -> State -> UI).
   - **Performance Strategy**:
     - *State Management*: How to ensure O(1) updates.
     - *Interaction*: How to ensure <100ms response (Optimistic UI).
     - *Computation*: Identification of heavy logic to move to Web Workers or Memoize.
   - **Risk Assessment**: "What happens if the API fails?" (Error Boundaries/Fallbacks).

3. **User Sign-Off**:
   - Stop and present the plan. **Do not write a single line of feature code until the User approves the Blueprint.**

## Phase 2: "Big Tech" Implementation
**Role**: Senior Frontend/Backend Engineer
**Goal**: Write code that survives code review.

1. **Environment & Skeleton**:
   - Create directories/files.
   - **Rule**: No file > 300 lines. Break it down.
   - Implement the "Skeleton" (UI without logic) to verify layout and animations first.

2. **Core Logic (The Engine)**:
   - Implement the business logic.
   - **Strict Rule**: Use `useMemo` and `useCallback` by default for all object/array props and expensive calculations.
   - **Strict Rule**: Never block the main thread. Async everything possible.

3. **UI Integration & Polish**:
   - Connect Logic to Skeleton.
   - **Aesthetics**: Apply "Premium" design tokens. No defaults.
   - **Micro-interactions**: Add subtle transition states (entering, exiting, loading).

## Phase 3: Verification & "The Bar Raiser"
**Role**: QA Automation Engineer

1. **Self-Correction Loop**:
   - Review the written code.
   - *Self-Prompt*: "Would this pass a Google Code Review?"
   - If not, refactor immediately. Focus on variable naming, dead code removal, and comprehensive commenting (Why, not What).

2. **Walkthrough & Evidence**:
   - Create `walkthrough.md`.
   - **Mandatory**: Include a section called "Performance Validation" proving the solution is lag-free.
   - **Mandatory**: Screenshots/Videos of the feature in action.
3 also i am making this app so that it will be later on cloud so keep that in mind it is just on local but for future it will be on cloud so make thing according to it
---
**Trigger this workflow by finding complex tasks and running: `/new_feature [Task Description]`**