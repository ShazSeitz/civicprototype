# Voter Information Tool - Project Overview

## Intent
To provide an accessible, free tool for US voters that:
- Gives nonpartisan voting advice based on where you live and what matters to you
- Makes clear suggestions without political bias
- Works for both current elections and practice mode
- Connects your concerns to real political data
- Helps you take action on what matters to you

## Core Rules

### 1. Data Rules
- Never make up election data
- Only use real facts from trusted sources
- Exception: Practice mode uses 4 fixed presidential candidates

### 2. How to Talk to Users
- Be friendly and professional
- Say things like "I understand" or "I notice"
- Be helpful without being pushy
- Treat all users with respect
- Don't assume political views
- Use neutral words, not political terms
- Focus on issues, not parties
- Be a helpful tool, not an advisor
- Don't take sides on any issue

### 3. How to Handle Different Situations
- **When Something is Unclear**:
  - Ask simple questions to understand better
  - Example: "You mentioned schools. Could you tell me what about schools matters most to you?"
  - Use the same words the user used
  - For tricky topics, ask clear questions
  - Example: "I see you're concerned about the Jan 6th events. Are you worried about pardons for the people involved?"

- **When Priorities Might Conflict**:
  - Simply point out the conflict
  - Example: "Better public transit and lower taxes might be hard to do at the same time. I'll show you options for both."
  - Don't judge the conflict
  - Just provide options for both sides

- **When Users Say Something Inappropriate**:
  - Just say "Sorry, I can't help with that"
  - Don't repeat bad language
  - Move on to the next topic

- **When Users Mention Political Parties**:
  - Say: "I'll show you all options that match what you care about"
  - Focus on issues, not parties
  - Stay neutral

### 4. How to Structure Responses
- Start with:
  ```
  "Here's what I understand you care about: [list issues].
  [If needed: One simple sentence about conflicts]
  [If needed: One simple question to understand better]"
  ```
- Then give suggestions:
  ```
  "Based on your interest in [topic], here are some options that might work for you..."
  ```
- Always check if users want to change or add anything
- Keep it short and clear
- When there are conflicts, show options for both sides

### 5. AI Guidelines
- AI should:
  - Understand what users write
  - Find real information in our database
  - Write clear, personal responses
  - Turn user concerns into useful suggestions
- AI must:
  - Never make up information
  - Always talk directly to users ("you" and "your")
  - Ask questions when things aren't clear
  - Be a helpful tool, not an advisor

## Core Features

### 1. User Input System
- **Mode Selection**
  - Current Date: Uses live election cycle data
  - DEMO: November 2024 Election (fixed POTUS candidates)
- **Location Input**
  - 5-digit ZIP code validation
  - Region-specific recommendations
- **Priority System**
  - 6 free-text priority inputs (250 char limit each)
  - Drag-and-drop priority ranking
  - Real-time updates capability
- **Priority Analysis**
  - Natural language understanding of user inputs
  - Translation to standardized political terms
  - Example mappings:
    - "government waste" → "fiscal responsibility"
    - "helping the poor" → "social welfare policy"
    - "gun rights" → "Second Amendment rights"
    - "protecting nature" → "environmental conservation"
  - Context-aware interpretation
  - Nonpartisan terminology usage

### 2. Recommendation Engine
- **Current Date Mode (With Active Election)**
  - Elected official recommendations
  - Ballot measure analysis
  - Draft emails to representatives
  - Interest group links
  - Relevant petition recommendations
- **Current Date Mode (No Active Election)**
  - Draft emails to current representatives
  - Interest group recommendations
  - Relevant petition links
- **DEMO Mode**
  - Local & federal candidate recommendations
  - Fixed POTUS candidate analysis (4 candidates)
  - Ballot measure recommendations

### 3. Output Dashboard
- Location and mode context
- Prioritized user concerns with standardized terminology mapping
- Natural language analysis of user priorities
- Actionable recommendations
- One-click email drafts
- Direct links to resources

## Technical Architecture

### Frontend
- Responsive web interface
- Real-time updates
- Accessibility features
- Copy/paste functionality for emails

### Backend
1. **API Integrations**
   - Federal Election Commission (FEC) API
   - Google Civic Information API
   - OpenAI API for NLP
   - Change.org data integration
   - HUD public interest groups

2. **Data Processing**
   - Real-time recommendation updates
   - Priority conflict detection
   - Natural language processing
   - User input validation
   - Political terminology standardization
   - Context-aware interpretation

### Performance Requirements
- Support for 100 concurrent users
- Low latency updates
- Modular architecture for scaling

## Data Sources
1. **Primary APIs**
   - FEC API (api.open.fec.gov)
   - Google Civic API
2. **Secondary Sources**
   - HUD Public Interest Groups
   - Change.org petitions
   - Official candidate websites
3. **Language Processing**
   - Political terminology database
   - Common phrase mappings
   - Regional context awareness

## Future Enhancements (V2)
1. **Extended Features**
   - PDF export functionality
   - Social sharing capabilities
   - Advanced survey integration
   - Enhanced terminology mapping
2. **Infrastructure**
   - Enhanced scalability
   - Additional data sources
   - Advanced analytics

## Testing & Deployment
1. **Testing Requirements**
   - User acceptance testing across diverse voter groups
   - Cross-browser compatibility
   - Performance under load
   - Terminology mapping accuracy
2. **Deployment Strategy**
   - Cloud hosting with load balancing
   - Regular data source updates
   - Continuous monitoring
