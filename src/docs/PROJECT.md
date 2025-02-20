
# Voter Information Tool - Project Overview

## Intent
To provide an accessible, free tool for US voters that:
- Generates nonpartisan election advice based on zip code and personal values
- Returns actionable recommendations without partisan rhetoric
- Supports both current election scenarios and demonstration modes
- Maps user concerns to factual political data
- Generates actionable outputs for civic engagement

## Core Rules
1. **Data Integrity**
   - AI must NEVER invent election data
   - All data must be real and factual from verified databases
   - Exception: DEMO mode uses fixed set of 4 POTUS candidates
2. **AI Usage**
   - AI (ChatGPT) restricted to:
     - Natural Language Processing
     - Mapping user inputs to database information
     - Articulating user priorities and concerns
   - AI must never generate fictional information

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
- Prioritized user concerns
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

## Future Enhancements (V2)
1. **Extended Features**
   - PDF export functionality
   - Social sharing capabilities
   - Advanced survey integration
2. **Infrastructure**
   - Enhanced scalability
   - Additional data sources
   - Advanced analytics

## Testing & Deployment
1. **Testing Requirements**
   - User acceptance testing across diverse voter groups
   - Cross-browser compatibility
   - Performance under load
2. **Deployment Strategy**
   - Cloud hosting with load balancing
   - Regular data source updates
   - Continuous monitoring

