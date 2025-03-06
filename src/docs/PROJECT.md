

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
        DEMO Mode: November 2024 Election (fixed POTUS candidates).
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
        Links to relevant interest groups.
        Petition recommendations.
    Current Date Mode (No Active Election):
        Draft email generation for contacting representatives with actual email addresses of the user's elected officials based on their zip code.
        Interest group recommendations.
        Relevant petition links.
    DEMO Mode:
        Local and federal candidate recommendations.
        Fixed analysis for 4 POTUS candidates.
        Ballot measure suggestions.
        Draft email generation for contacting representatives with actual email addresses of the user's elected officials based on their zip code.
        Interest group recommendations.
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
        HUD public interest groups.
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
        HUD Public Interest Groups.
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

