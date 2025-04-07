import { VoterFormValues } from "@/schemas/voterFormSchema";

// Test personas data for demonstrations
export const personas = [
  {
    zipCode: "94925",
    priorities: [
      "Funding for headstart and after school programs (important for single mom)",
      "The cost of housing in the Bay Area",
      "I suspect that there is a lot of waste in government and that many departments need to be made more effective and efficient and accountable",
      "I support everyone's right to live however they wish to live and to have all of the rights and protections set out in the constitution and BIll of Rights, but I don't want to be asked what my pronouns are!",
      "Homelessness and fentanyl problem",
      "Protection of national parks and wildlife sanctuaries"
    ]
  },
  {
    zipCode: "15301",
    priorities: [
      "I am tired of paying so much income tax! I work hard for my money and want some to pass on to my children.",
      "I think that it is disgraceful that race or gender are used to decide whether or not to hire someone.",
      "I think climate change is probably a hoax but I'm not sure",
      "My town desperately needs more and more affordable local transportation options",
      "I am angry that Jan 6th rioters may get pardoned as many are violent criminals",
      "I'm afraid AI could lead to scary Sci-fy like stuff, but it's too hard for me to understand."
    ]
  }
];

// Legacy format support
export const testPersonas = {
  persona1: personas[0],
  persona2: personas[1]
};

// Pool of potential priorities for random generation with everyday language
export const priorityPool = [
  "I can't afford my medical bills and I'm worried about my family's health",
  "The schools in my neighborhood are falling apart and my kids aren't learning enough",
  "Gas prices are too high and I'm worried about being able to afford my commute",
  "Our veterans aren't getting the help they need when they come home",
  "Politicians stay in office too long and nothing ever changes",
  "I'm worried about companies knowing too much about me online",
  "I have no idea where my tax money goes and it feels like it's wasted",
  "The government keeps spending money we don't have",
  "I'm worried Social Security won't be there when I retire",
  "Small shops in my town are closing because they can't compete with big stores",
  "My prescription costs more than my car payment",
  "My kid's college loans are crushing them financially",
  "Internet at my house is terrible and I can't work from home",
  "I have to drive everywhere because there's no good bus service",
  "It seems like politicians pick their voters instead of voters picking politicians",
  "There are too many shootings in schools and we need to do something",
  "The government shouldn't touch our guns - it's our right to protect ourselves",
  "We should try talking to other countries more before getting into conflicts",
  "Too many people are crossing the border illegally and it's not fair",
  "It takes way too long for immigrants to become citizens even when they follow all the rules",
  "The Supreme Court seems more political than fair these days",
  "Some police officers get away with treating minorities badly",
  "Police are being attacked and disrespected and need more support",
  "Women should be able to make their own healthcare decisions without government interference",
  "My religious values are under attack in today's culture"
];

// Helper functions for random generation
export const getRandomZipCode = () => {
  const zipDigits = [];
  for (let i = 0; i < 5; i++) {
    zipDigits.push(Math.floor(Math.random() * 10));
  }
  return zipDigits.join('');
};

export const getRandomPriorities = () => {
  const shuffled = [...priorityPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};
