
# VoterPrime - Project Documentation

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

## Inputs:

- Users enter their zip code
- Users describe their top 6 most salient values/concerns in their own words and in their native language

## Outputs:

- Priorities mapping - Political Priorities Mapping Engine evaluates the user's top concerns and maps them to policy terms.
    - User can clarify their priorities as many times as they wish or ask for recommendations when they are satisfied that they are understood
- *IF it's an election cycle:*
    - The tool maps their concerns with candidates from the local to the national level, and it calls out any conflicts (where the candidate is a match in one way but not in others)
    - The tool highlights relevant ballot measures they may wish to vote on
- *Regardless of election cycle:*
    - The tool provides email addresses and helps draft messages to their current elected local officials about their top 3 concerns
    - The tool provides brief descriptions of interest groups they may wish to join (from HUD website)
    - The tool links to relevant petitions they may wish to sign (from Change.org)

## Current Features:

- User input of priorities with drag-and-drop reorganization
- Real-time form validation
- Test personas for demonstration
- Random persona generation with everyday language
- Recommendation analysis based on user input

## Features for MVP:

- Save results

## High Value Future Features:

- Compare and contrast tables showing trade offs of different candidates and ballot issues
- Share features

