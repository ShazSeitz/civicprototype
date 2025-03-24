
# VoterPrime – Project Documentation

## 1. Purpose & Value Proposition

VoterPrime is a nonpartisan primer that makes it easy for US citizens to make confident voting decisions and become engaged participants in democracy. By entering their zip code and articulating their priorities in their own words, users receive customized, factual recommendations on candidates and ballot measures, copy-and-send emails to relevant elected officials, and learn about interest groups and petitions that align with their core values and concerns.

- **Empowerment**: Users make informed decisions without wading through partisan rhetoric or sensationalized news.
- **User-Friendly Detail**: Both quick summaries and in-depth details on candidates, issues, and interest groups.
- **Actionable Outputs**: Direct links, editable draft emails, and clear recommendations.
- **Party-Agnostic Approach**: Maps authentic user input (via free-text) to standardized policy categories using a Political Priorities Mapping Engine powered by natural language processing (NLP) and sentiment analysis.
- **Dual Modes**: Supports both real election cycles (using live data) and a DEMO mode simulating the November 2024 election with a fixed candidate set.

**Recommendation Language Standard**
- Must be plain spoken (assume a high school education level), factual, and friendly.

## 2. Underlying Hypotheses

- **Shifting Voter Engagement**: Citizens who engage with democracy based on their core values—rather than partisan outrage—will push politicians toward problem-solving policies.
- **Targeting Disengaged Voters**: This solution is designed for disengaged voters, especially younger demographics, who prefer tech-driven, mobile-first tools over traditional political content.

## 3. Target Audience

- **Primary**: All eligible voters, with a focus on 18–29-year-olds (historically low voter turnout, but highly tech-savvy).

## 4. Inputs & User Interaction

### 4.1. Input Fields

- **Mode Selection**:
  - Options: "Current Date" or "DEMO: November 2024 Election."
    - Current Date: Uses live election data.
    - DEMO: Simulates the November 2024 election with fixed candidate data.
- **Zip Code**:
  - 5-digit numeric field (exactly five digits).
- **Top 6 Priorities**:
  - Free-text entries (up to 250 characters each).
  - Users can enter multiple concerns and reorder them via drag-and-drop.
  - "Did we get this right? - input box with SUBMIT for clarifications - initiates updated evaluation and mapping
  - Yes - show me recommendations - initiates processing

### 4.2. Real-Time Editing & Feedback

- **Dynamic Updates**: Inputs (zip code or priorities) trigger immediate refreshes in recommendations.
- **Conflict Detection**: NLP flags contradictory or ambiguous entries and prompts users for clarification.
- **Test Personas**:
  - Buttons for loading predefined personas or generating a random persona (populating zip code and priorities, and setting mode to demo).

## 5. Outputs & Presentation

### 5.1. Mode-Specific Recommendations

#### A. Current Date Mode

- **With Upcoming Election (ballots available)**:
  - Elected Official Recommendations: From local offices to POTUS.
  - Ballot Measure Recommendations: Based on the user's zip code.
  - Draft Emails: Ready-to-send, editable emails for contacting elected officials.
    - Uses logic defined in supabase/functions/analyze-priorities/index.ts.
  - Interest Groups & Petitions: Direct links to curated HUD interest group pages and active Change.org petitions.

- **Without Upcoming Election**:
  - Draft Emails, Interest Groups & Petitions: Same as above (no candidate or ballot measure recommendations).

#### B. DEMO: November 2024 Mode

- **Candidate Recommendations**:
  - Local candidates
    - A compare/contrast table for their top two matches for each category of office
  - POTUS Options (Up to Four): Each with:
    - Platform highlights (short bullet points).
    - Rationale for top recommendation based on user priorities.
    - A compare/contrast table
  - Ballot Measure Recommendations:
    - Uses the same recommendation logic as the current election cycle.
    - Explain who is for/against each ballot that maps to the user's priorities

### 5.2. Summary Output Dashboard

- **Header Information**:
  - Mode: [Current Date or DEMO: November 2024]
  - For: (Zip: [Zip Code], [Region Name])
- **Priorities Mapping**:
  - Header: Priorities Mapping
  - Subheader: "We have mapped your priorities to policy terms to provide the best recommendations. Please review and clarify if needed."
  - Two buttons: Clarify / Get Recommendations
  - Editable mapping analysis (user can edit repeatedly).
  - Formatting: Bullet list of short, concise, left-justified sentences describing the nuance of the user's concerns and how they map to policy terms. Call out of potentially conflicting priorities
- **Recommendations Section** (for Current Date with an Upcoming Election):
  - Elected Official Recommendations (Local to POTUS).
  - Ballot Measure Recommendations.
  - Draft Emails, Interest Group links, and Petition links.
- **User Options**:
  - Save/Share recommendations (save to device)

## 6. Outputs Summary (Regardless of Election Cycle)

- **Priorities Mapping**:
  - The Political Priorities Mapping Engine converts free-text input into standardized policy categories using src/config/issueTerminology.json.
  - Users can refine their mapped priorities before receiving recommendations.
- **Candidate & Ballot Measure Matching**:
  - Election Cycle: Matches candidates and ballot measures to user priorities.
- **Advocacy Email Generation**:
  - Provides email addresses and draft messages to local elected officials regarding the user's top 3 concerns.
  - Uses logic defined in supabase/functions/analyze-priorities/index.ts.
- **Additional Recommendations**:
  - Interest Groups via HUD website https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups
  - Petitions (Change.org).
- **User Options**:
  - Save/Share recommendations (native share via device)

## 7. Application Interface Components

### 7.1. API Connection Verification

- **API Connection Buttons**:
  - Check Google Civic API Connection
  - Check FEC API Connection
  - Visual Indicators: Green checkmark (success) or red alert (failure).
  - Toast Notifications: Display connection status details.

### 7.2. Debug Tools

- **Terminology Debug Tool**:
  - Tests the terminology mapping system (via src/config/issueTerminology.json).
  - Displays matched categories, confidence scores, and recognized standardized terms.

### 7.3. Email Generation Logic

- **Evaluation of Elected Officials**:
  - Officials are categorized into three groups:
    - Aligned Officials: Likely to support user's priorities.
    - Opposing Officials: Likely to oppose user's priorities.
    - Key Decision Makers: Those with a mixed/neutral stance.
- **Email Drafts Use Defined Messaging Strategies**:
  - Supportive: Thank-you and reinforcement.
  - Opposing: Educational and persuasive.
  - Mixed: Acknowledgment with persuasion.

## 8. Rules & Data Integrity

- **Data Authenticity**:
  - No AI-generated election data.
  - All election data must be sourced from FEC and Google Civic APIs.
- **NLP & Mapping Constraints**:
  - ChatGPT is only used for natural language processing (NLP) and structuring user input.
  - Mapping of priorities must use src/config/issueTerminology.json.
  - Email drafts must follow templates in supabase/functions/analyze-priorities/index.ts.

## 9. Data Integration & Sources

### 9.1. Primary Data Sources

- **FEC API**:
  - Candidate profiles, finance data, and official records.
  - Mapped to user priorities.
- **Google Civic API**:
  - Provides ballot options & measures.
  - Used for local, state, and national election recommendations.
  - API keys stored securely.

### 9.2. External Links & Curated Content

- **Interest Groups**:
  - Uses HUD interest group database (https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups).
- **Petition Sites**:
  - Change.org petitions (https://www.change.org/search) mapped to user priorities.

## 10. System Architecture & Technical Considerations

### 10.1. Front-End

- **User Interface**:
  - Clean, intuitive, mobile-first design.
  - Real-time dashboard updates and accessibility features.

### 10.2. Back-End

- **Real-Time Processing**:
  - Zip code and priorities trigger immediate refreshes.
- **Scalability**:
  - Designed for up to 100 concurrent users.

## Additional MVP Output Features

- **Civic Education Content**: Provides users with curated educational materials on civic topics—including guides on the political process, voting procedures, and candidate analysis—to foster a deeper understanding of democracy.
- **Notifications**: Real-time alerts and push notifications about election updates, new recommendations, and changes to candidate or ballot measure information.
- **Share Functionality**: Enables users to share their priorities mapping, recommendations, and civic education content via social media or email to boost civic engagement.
- **Comprehensive List of Elected Officials & Contacts**: Offers a complete directory of elected officials from local to national levels along with contact details for extended outreach.
