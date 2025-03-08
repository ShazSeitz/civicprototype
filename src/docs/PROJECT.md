# Voter Information Tool - Project Overview

## Value Proposition:

**VoterPrime is a non partisan primer that makes it easy for US citizens to make confident voting decisions and become engaged participants in democracy.**

- By entering their zip code and articulating their priorities in their own words, a user can quickly get customized recommendations to help them make informed decisions about candidates and ballot measures, copy and send emails to relevant elected officials, and learn about interest groups and petitions that align with their core values and most salient concerns.
- It's not enough to increase voter turnout or make voting more accessible, we also need to help voters make confident voting decisions at a time when partisanship, political fatigue and mistrust in both media and institutions is at an all time high.
- Consumers expect their shopping apps to allow them to compare and contrast purchase options, save items to a shopping cart while they decide, receive updates, submit their own feedback, and celebrate their decisions.
- VoterPrime will be the Zappos of voter decision making.

**Value:**

- Negative partisanship, political disenfranchisement, erosion of dialogue and mistrust of institutions are at an all time high. This party agnostic solution helps users make informed voting decisions having to decipher hyperbolic headlines, analyze complex news information, or even talk to their friends and family.
- The Political Priorities Mapping Engine within this solution is an advanced machine learning layer that uses natural language processing and multi-dimensional sentiment analysis to convert free-text voter input into standardized policy categories. It sits on top of an integrated database ecosystem, ensuring that complex and nuanced political expressions are accurately and consistently mapped to election data from highly trusted databases (currently FEC and Google Civic).
    - Unlike professional polling which relies on close-ended questions with predefined (often highly partisan) answer options, this approach runs on authentic voter sentiment.
    - Entrenched partisan identities and media silos are extremely problematic. This tool is about ignoring that entirely and just providing substantive information aligned to the user's inputs.
    - NOTE: For deployment the mapping engine will be refined and validated by professional policy experts
- The app will also connect users to existing trusted sources for voter information (where to vote) and options about how to vote.

**Target Audience: All eligible voters**

- While this solution is for all eligible voters, the 18-29 are the primary initial target
    - Historically, 18–29-year-olds have the lowest voter turnout.
    - They are digital natives who expect tech-driven solutions.
    - They prefer seamless, mobile-first, and online experiences.
    - They demand intuitive, integrated tools for civic engagement.

**Underlying Hypotheses**

- When citizens engage with democracy based on their core values and concerns instead of hyperbolic outrage-inducing headlines, their choices and voices will push politicians to solve problems, promote more centrist policies, and promote progress.
- This approach might not appeal to highly engaged, highly partisan citizens who like their media silos and confirmation bias. Instead it would target voters who have been disengaged (so a marketing challenge!)

**Inputs:**

- Users enter their zip code
- Users describe their top 6 most salient values/concerns in their own words and in their native language

**Outputs:**

- Priorities mapping - Political Priorities Mapping Engine evaluates the user's top concerns and maps them to policy terms.
    - User can clarify their priorities as many times as they wish or ask for recommendations when they are satisfied that they are understood
- *IF it's an election cycle:*
    - The tool maps their concerns with candidates from the local to the national level, and it calls out any conflicts (where the candidate is a match in one way but not in others)
    - The tool highlights relevant ballot measures they may wish to vote on
- *Regardless of election cycle:*
    - The tool provides email addresses and helps draft messages to their current elected local officials about their top 3 concerns
    - The tool provides brief descriptions of interest groups they may wish to join (from HUD website)
    - The tool links to relevant petitions they may wish to sign (from Change.org)

**Add features for MVP:**
- Save results

**High Value Future Features:**
- Compare and contrast tables showing trade offs of different candidates and ballot issues
- Share features

## Intent: To provide an accessible, free tool for US voters that:

    Gives nonpartisan voting advice based on where you live and what matters to you
    Makes clear suggestions without political bias
    Works for both current elections and practice mode
    Connects your concerns to real political data
    Helps you take action on what matters to you

Core Rules:

    Data Rules

    Never make up election data.
    Only use real facts from trusted sources.
    Exception: Practice mode uses 4 fixed presidential candidates.

    How to Talk to Users

    Be friendly and professional.
    Use phrases like "I understand" or "I notice."
    Be helpful without being pushy.
    Treat all users with respect.
    Don't assume political views.
    Use neutral words, not political jargon.
    Focus on issues, not parties.
    Be a helpful tool, not an advisor.
    Don't take sides on any issue.

    How to Handle Different Situations

3.1. Mapping and Analyzing User Input

    Terminology Lookup Function: All user input is processed through a centralized terminology lookup function that utilizes a master JSON configuration file (the Terminology JSON) stored on GitHub. This file contains:
        A comprehensive list of political issues.
        A "plainLanguage" array for keyword matching.
        A "standardTerm" field for standardizing political priorities.
        A "plainEnglish" description expressed in accessible, high-school level language.
        A "nuance" object with weighted keys capturing both supportive and opposing sentiments for each issue. Example: The climate category includes nuance keys such as "climate_action", "environmental_protection", "climate_skepticism", and "climate_hoax", allowing the system to detect whether a user supports proactive climate measures or is a skeptic.
    Config File References: All related configuration files on GitHub must reference each other appropriately. The primary Terminology JSON is the authoritative source for mapping, and any updates must propagate consistently across the system.

3.2. Handling Ambiguity and Conflicts

    Detection of Ambiguity: The system computes confidence scores for each potential mapping based on keyword matches and nuance weightings.
        Low Confidence or Conflicting Signals: If no single mapping exceeds a predefined confidence threshold—or if multiple mappings are triggered with conflicting nuance values—the input is deemed ambiguous.
    Fallback and Clarification: For ambiguous or conflicted inputs, the system should not force a mapping. Instead, it must return a standardized fallback response: "Can you please clarify your stance on [user's language]?" This ensures that the tool only acts on what the user has explicitly stated, without making additional assumptions.

3.3. Capturing Hard-to-Map Terms

    Logging Ambiguous Inputs: Any user input that the system cannot confidently map must be logged in a separate configuration file called needsTermMapping.json. This file should capture:
        The raw user input.
        The computed confidence scores for attempted mappings.
        An indicator that the input did not meet the clear mapping threshold.
    Continuous Improvement: The needsTermMapping.json file serves as a feedback mechanism. Regular reviews of this file will inform updates to the Terminology JSON, enabling the tool to improve its mapping accuracy over time.

    How to Structure Responses

    Start with: "Here's what I understand you care about: [list issues]. [If needed: One simple sentence noting any conflicts] [If needed: One simple question to clarify further]"
    Then give suggestions: "Based on your interest in [topic], here are some options that might work for you..."
    Always check if users want to modify or add anything.
    Keep responses short and clear.
    When there are conflicts, present options for both sides.

    AI Guidelines

    AI should:
        Understand what users write.
        Retrieve real, verified information from our database.
        Write clear, personal responses.
        Turn user concerns into actionable suggestions.
    AI must:
        Never fabricate information.
        Address users directly ("you" and "your").
        Ask clarifying questions when needed.
        Serve as a helpful tool, not a personal advisor.

Core Features:

    User Input System

    Mode Selection:
        Current Date Mode: Uses live election cycle data.
        DEMO Mode: November 2024 Election.
    Location Input:
        5-digit ZIP code validation.
        Region-specific recommendations.
    Priority System:
        6 free-text priority inputs (up to 250 characters each).
        Drag-and-drop priority ranking.
        Real-time updates.
    Priority Analysis:
        Natural language understanding of user inputs.
        Translation into standardized political terms via the Terminology Lookup function.
        Context-aware interpretation.
        Nonpartisan terminology usage.

    Recommendation Engine

    Current Date Mode (Active Election):
        Recommendations for elected officials.
        Analysis of ballot measures.
        Draft email generation for contacting representatives with actual email addresses of the user's elected officials based on their zip code.
        Links to verified HUD interest groups only (no AI-generated or made-up groups).
        Petition recommendations.
    Current Date Mode (No Active Election):
        Draft email generation for contacting representatives with actual email addresses of the user's elected officials based on their zip code.
        Verified HUD interest group recommendations only.
        Relevant petition links.
    DEMO Mode:
        Local and federal candidate recommendations.
        Ballot measure suggestions.
        Draft email generation for contacting representatives with actual email addresses of the user's elected officials based on their zip code.
        Verified HUD interest group recommendations only.
        Relevant petition links.

    Output Dashboard

    Displays location and mode context.
    Lists prioritized user concerns mapped to standardized terminology.
    Provides actionable recommendations.
    Offers one-click email draft functionality.

Technical Architecture:

Frontend:

    Responsive web interface.
    Real-time updates.
    Accessibility features.
    Copy/paste functionality for email drafts.

Backend:

    API Integrations:
        Federal Election Commission (FEC) API.
        Google Civic Information API.
        OpenAI API for NLP.
        Change.org data integration.
        HUD public interest groups data (verified source).
    Data Processing:
        Real-time recommendation updates.
        Priority conflict detection.
        Natural language processing.
        User input validation.
        Political terminology standardization.
        Context-aware interpretation.

Performance Requirements:

    Support for 100 concurrent users.
    Low latency updates.
    Modular architecture to scale with demand.

Data Sources:

    Primary APIs:
        FEC API (api.open.fec.gov).
        Google Civic API.
    Secondary Sources:
        HUD Public Interest Groups (verified only).
        Change.org petitions.
        Official candidate websites.
    Language Processing:
        Political terminology database.
        Common phrase mappings.
        Regional context awareness.

Future Enhancements (V2):

    Extended Features:
        PDF export functionality.
        Social sharing capabilities.
        Advanced survey integration.
        Enhanced terminology mapping.
    Infrastructure:
        Enhanced scalability.
        Additional data sources.
        Advanced analytics.

Testing & Deployment:

Testing Requirements:

    User acceptance testing with diverse voter groups.
    Cross-browser compatibility.
    Performance testing under load.
    Verification of terminology mapping accuracy.

Deployment Strategy:

    Cloud hosting with load balancing.
    Regular updates to data sources.
    Continuous monitoring and feedback loops.


## Advocacy Criteria for Email Recommendations

    Input Data:
        User Data: Use the user's zip code and their top 3 priorities.
        Mapped Policy Terms: Ensure each of the 3 priorities is linked to the appropriate, standardized policy terms.

    Retrieve and Map Elected Officials:
        Source: Use Google Civic data to retrieve all elected officials for the given zip code.
        Mapping: For each official, map their voting record, public positions, or relevant policy actions to the user's 3 policy terms.

    Evaluate and Categorize Officials by Priority:
        For Each Priority:
            Key Decision Maker Check: Identify if there is a "key decision maker" for that priority. This may be determined by factors such as influential committee roles, a pivotal voting record, or strong public statements on the issue.
            Default Option: If no key decision maker exists for the priority, identify the official classified as "may oppose" (i.e., one who is neutral or has a negative alignment with the policy term).

    Select Unique Officials:
        One Official per Priority: Ensure that each of the 3 emails is sent to a different elected official. No single official should appear in more than one category.
        Conflict Resolution: If one official qualifies as a key decision maker (or "may oppose") for multiple priorities, assign them to the priority where their impact is most critical. For other priorities, select the next best candidate to maintain distinct recipients.

    Generate Tailored Email Templates:
        Template Personalization: Create 3 email templates that each focus on one of the top 3 priorities. Each template should:
            Include the official's name and the user's zip code.
            Reference the specific priority and the corresponding mapped policy term.
            Use messaging appropriate to the official's category:
                Key Decision Maker: Emphasize the urgency and potential influence of their decision.
                May Oppose: Request reconsideration or urge them to align with constituent concerns.
        Tone: Maintain respectful and concise language, ensuring the email clearly articulates the user's position on that specific issue.

    Final Review and Customization:
        User Review: Allow the user to review each of the 3 tailored emails.
        Editing Option: Provide an option for the user to make final adjustments before sending.
