



# Voter Information Tool - Project Overview

Intent: To provide an accessible, free tool for US voters that:

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
