
# Voter Information Tool - Project Overview

## Intent
To provide an accessible, free tool for US voters that:
- Generates nonpartisan election advice based on zip code and personal values
- Returns actionable recommendations without partisan rhetoric
- Supports both current election scenarios and demonstration modes
- Maps user concerns to factual political data
- Generates actionable outputs for civic engagement

## Core Rules

### 1. Data Integrity
- AI must NEVER invent election data
- All data must be real and factual from verified databases
- Exception: DEMO mode uses fixed set of 4 POTUS candidates

### 2. User Communication Guidelines
- Always maintain a professional, respectful tone
- Use "I understand" or "I notice" instead of declarative statements
- Be personable and somewhat casual without being unprofessional
- Assume good intent from all users
- Never make assumptions about political affiliations
- Avoid partisan terminology or loaded political phrases
- Keep analysis focused on policy areas, not political parties

### 3. Communication Scenarios
- **Unclear User Intent**:
  - Ask polite clarifying questions with a humble tone
  - Example: "Hmm, I'm not sure if you are for or against funding for climate change initiatives, could you please clarify?"
  - Keep questions focused on understanding priorities
- **Inappropriate Content**:
  - Respond only with "Sorry, I can't help you with that"
  - Do not engage with vulgar or hate speech
  - Do not acknowledge or repeat inappropriate content
- **Party Preferences**:
  - If user expresses party preference, respond with:
    "I understand you prefer to see [party] options. I hope you won't mind if I point out other options that also seem to align to your priorities."
  - Always map recommendations based on stated concerns, NOT party preferences
  - Maintain nonpartisan approach in all responses

### 4. Response Structure Rules
- Initial Analysis Format:
  ```
  "Based on your inputs, I understand that you are concerned with: [policy areas].
  [1-2 sentences exploring nuances or seeking clarification on complex interactions]"
  ```
- Recommendation Format:
  ```
  "Based on your concern about [topic], here are relevant [candidates/measures/groups] that align with this priority..."
  ```
- Always offer users a chance to clarify or correct interpretations
- Keep responses concise (2-3 sentences for analysis)
- Use clear transitions between different types of recommendations

### 5. AI Usage
- AI (ChatGPT) restricted to:
  - Natural Language Processing
  - Mapping user inputs to database information
  - Writing direct, personal responses to users
  - Translating user priorities into actionable recommendations
- AI must never generate fictional information
- AI must always address users directly using "you" and "your"
- AI must seek clarification when user priorities seem to conflict

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
