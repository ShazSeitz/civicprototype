export interface TestPersona {
  name: string;
  description: string;
  priorities: string[];
  zipCode: string;
}

export const personas: TestPersona[] = [
  {
    name: "Concerned Parent",
    description: "Single mom focused on education and community safety",
    priorities: [
      "Funding for headstart and after school programs (important for single mom)",
      "The cost of housing in the Bay Area",
      "I suspect that there is a lot of waste in government and that many departments need to be made more effective and efficient and accountable",
      "I support everyone's right to live however they wish to live and to have all of the rights and protections set out in the constitution and Bill of Rights, but I don't want to be asked what my pronouns are!",
      "I want my kids to be safe at school and in the community",
      "I want my kids to have a good education and to be able to afford college"
    ],
    zipCode: "94925" // Corte Madera, CA
  },
  {
    name: "Skeptical Voter",
    description: "Conservative-leaning voter with mixed views on current issues",
    priorities: [
      "I am tired of paying so much income tax! I work hard for my money and want some to pass on to my children.",
      "I think that it is disgraceful that race or gender are used to decide whether or not to hire someone.",
      "I think climate change is probably a hoax but I'm not sure",
      "My town desperately needs more and more affordable local transportation options",
      "I am angry that Jan 6th rioters may get pardoned as many are violent criminals",
      "I'm afraid AI could lead to scary Sci-fy like stuff, but it's too hard for me to understand."
    ],
    zipCode: "78701" // Austin, TX
  }
];

export const randomPriorities = [
  "Healthcare access",
  "Education funding",
  "Public safety",
  "Infrastructure",
  "Housing affordability",
  "Job creation",
  "Veterans' benefits",
  "Mental health services",
  "Drug policy reform",
  "Immigration reform",
  "Gun control",
  "Voting rights",
  "Criminal justice reform",
  "Social security",
  "Medicare expansion",
  "Student debt relief",
  "Clean energy",
  "Public transportation",
  "Technology innovation",
  "Privacy protection"
];

export function getRandomPriorities(count: number = 6): string[] {
  const shuffled = [...randomPriorities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomZipCode(): string {
  const zipCodes = [
    "94105", // San Francisco, CA
    "78701", // Austin, TX
    "60601", // Chicago, IL
    "10001", // New York, NY
    "98101", // Seattle, WA
    "33101", // Miami, FL
    "80202", // Denver, CO
    "19103", // Philadelphia, PA
    "02108", // Boston, MA
    "90012"  // Los Angeles, CA
  ];
  return zipCodes[Math.floor(Math.random() * zipCodes.length)];
}
