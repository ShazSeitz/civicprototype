import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const issueTerminology = {
  taxBurden: {
    plainLanguage: [
      "tired of paying tax",
      "tax burden",
      "lower taxes",
      "paying too much tax",
      "tired of paying income tax",
      "work hard for my money",
      "pass on to my children",
      "tired of taxes",
      "hard earned money",
      "income tax",
      "paying so much tax",
      "tax relief",
      "tax cuts",
      "tax breaks",
      "reduce taxes",
      "working families",
      "middle class",
      "working class",
      "family taxes",
      "tax burden on workers"
    ],
    standardTerm: "Tax Burden and Relief",
    plainEnglish: "I am concerned about the tax burden and want to keep more of my income."
  },
  taxCutsForWealthy: {
    plainLanguage: [
      "tax cuts for job creators",
      "business tax relief",
      "corporate tax cuts",
      "wealth tax opposition",
      "capital gains tax",
      "estate tax relief",
      "tax cuts create jobs",
      "trickle down",
      "tax cuts stimulate economy"
    ],
    standardTerm: "Upper Income Tax Relief",
    plainEnglish: "I support tax cuts for high earners and businesses to stimulate economic growth."
  },
  taxWealthyMore: {
    plainLanguage: [
      "tax the rich",
      "wealth tax",
      "millionaire tax",
      "billionaire tax",
      "fair share taxes",
      "ultra wealthy taxes",
      "no tax cuts wealthy",
      "corporate tax loopholes",
      "tax the 1%",
      "progressive taxation",
      "make rich pay more"
    ],
    standardTerm: "Progressive Taxation and Wealth Tax",
    plainEnglish: "I want the ultra-wealthy and corporations to pay their fair share in taxes."
  },
  economy: {
    plainLanguage: [
      "inflation",
      "job security",
      "cost of living",
      "strong economy",
      "fair prices",
      "paycheck value"
    ],
    standardTerm: "Economic Conditions and Growth",
    plainEnglish: "I want a strong economy where prices are fair, jobs are secure, and my paycheck goes further."
  },
  healthcare: {
    plainLanguage: [
      "healthcare costs",
      "medical bills",
      "health insurance",
      "mental health",
      "long-term care"
    ],
    standardTerm: "Healthcare Access and Affordability",
    plainEnglish: "I want affordable healthcare that covers everything from doctor visits to mental health and long-term care."
  },
  climate: {
    plainLanguage: [
      "climate change",
      "global warming",
      "climate skepticism",
      "climate denial",
      "extreme weather",
      "pollution",
      "climate hoax"
    ],
    standardTerm: "Climate Change and Environmental Policy",
    plainEnglish: "I want our government to take action on climate change and protect our environment from extreme weather and pollution."
  },
  immigration: {
    plainLanguage: [
      "border security",
      "immigration reform",
      "border crisis",
      "illegal immigration",
      "legal immigration"
    ],
    standardTerm: "Immigration and Border Security",
    plainEnglish: "I want fair immigration policies that secure our borders while giving hardworking immigrants a chance."
  },
  politicalDivision: {
    plainLanguage: [
      "political division",
      "fake news",
      "misinformation",
      "partisan politics",
      "political polarization",
      "jan 6",
      "january 6",
      "capitol riot",
      "rioters",
      "violent criminals",
      "pardoned"
    ],
    standardTerm: "Political Polarization and Democratic Governance",
    plainEnglish: "I want to fix our broken politics, stop fake news, and keep our government honest and fair."
  },
  housing: {
    plainLanguage: [
      "affordable housing",
      "homelessness",
      "rent costs",
      "housing crisis",
      "property values"
    ],
    standardTerm: "Housing Affordability and Homelessness Prevention",
    plainEnglish: "I want safe, affordable housing for everyone and solutions to prevent homelessness."
  },
  education: {
    plainLanguage: [
      "school quality",
      "education costs",
      "student debt",
      "college affordability",
      "public schools"
    ],
    standardTerm: "Education and Student Opportunity",
    plainEnglish: "I want quality and affordable education for every student so we can build a better future."
  },
  publicSafety: {
    plainLanguage: [
      "crime",
      "police reform",
      "criminal justice",
      "law enforcement",
      "public safety"
    ],
    standardTerm: "Public Safety and Criminal Justice",
    plainEnglish: "I want safer communities and a fair justice system that truly protects us all."
  },
  inequality: {
    plainLanguage: [
      "wealth gap",
      "income inequality",
      "economic fairness",
      "wealth distribution",
      "economic opportunity"
    ],
    standardTerm: "Income Inequality and Wealth Distribution",
    plainEnglish: "I want a fair system where everyone has a chance to succeed—not just the wealthy."
  },
  technology: {
    plainLanguage: [
      "AI",
      "AI regulation",
      "artificial intelligence",
      "machine learning",
      "automation",
      "data privacy",
      "cybersecurity",
      "robots",
      "sci-fi",
      "sci-fy"
    ],
    standardTerm: "Technology Policy, AI regulation, Data Privacy, and Cybersecurity",
    plainEnglish: "I want strong protections for my personal data and safe, reliable technology that works for everyone."
  },
  foreignPolicy: {
    plainLanguage: [
      "national security",
      "foreign relations",
      "military strength",
      "international affairs",
      "global leadership"
    ],
    standardTerm: "Foreign Policy and National Security",
    plainEnglish: "I want our country to be secure at home and respected around the world."
  },
  laborRights: {
    plainLanguage: [
      "jobs",
      "employment",
      "work opportunities",
      "labor rights",
      "worker rights",
      "working conditions",
      "fair wages"
    ],
    standardTerm: "Labor Rights and Workers' Protections",
    plainEnglish: "I want better working conditions and fair treatment for all workers."
  },
  genderEquality: {
    plainLanguage: [
      "women's rights",
      "gender equality",
      "equal pay",
      "workplace discrimination",
      "gender discrimination",
      "race or gender",
      "hire someone"
    ],
    standardTerm: "Women's Rights and Gender Equality",
    plainEnglish: "I want equal rights and opportunities for women so that everyone can thrive."
  },
  civilLiberties: {
    plainLanguage: [
      "civil rights",
      "individual rights",
      "constitutional rights",
      "personal freedom",
      "civil liberties"
    ],
    standardTerm: "Civil Liberties and Individual Rights",
    plainEnglish: "I want to protect our basic freedoms and individual rights so everyone is treated fairly and freely."
  },
  reproductiveRights: {
    plainLanguage: [
      "abortion rights",
      "pro-choice",
      "reproductive healthcare",
      "abortion access",
      "family planning"
    ],
    standardTerm: "Abortion and Reproductive Rights",
    plainEnglish: "I want to ensure that everyone has access to safe, legal abortion and comprehensive reproductive healthcare."
  },
  proLife: {
    plainLanguage: [
      "pro-life",
      "abortion restrictions",
      "unborn rights",
      "traditional values",
      "sanctity of life"
    ],
    standardTerm: "Limited Abortion and Pro-Life Policies",
    plainEnglish: "I want to protect the rights of the unborn and restrict abortion to preserve traditional values."
  },
  churchAndState: {
    plainLanguage: [
      "religious freedom",
      "separation of church and state",
      "secular government",
      "religious influence",
      "public religion"
    ],
    standardTerm: "Separation of Church and State",
    plainEnglish: "I want our schools and government to be free from religious influence, ensuring fairness for everyone."
  },
  lgbtqRights: {
    plainLanguage: [
      "LGBTQ rights",
      "transgender rights",
      "gender identity",
      "sexual orientation",
      "equality"
    ],
    standardTerm: "LGBTQ+ Rights and Inclusion",
    plainEnglish: "I want equal rights for LGBTQ+ people—including fair treatment for trans individuals in all areas, like sports."
  },
  traditionalValues: {
    plainLanguage: [
      "traditional values",
      "anti-woke",
      "political correctness",
      "conservative values",
      "cultural values"
    ],
    standardTerm: "Traditional Values and Cultural Standards",
    plainEnglish: "I want a society that respects traditional values and free expression."
  },
  moralValues: {
    plainLanguage: [
      "moral standards",
      "ethics",
      "values",
      "principles",
      "moral guidance"
    ],
    standardTerm: "Moral Values and Ethical Standards",
    plainEnglish: "I want our society to stick to clear ethical principles that help guide our decisions about right and wrong."
  },
  personalLiberty: {
    plainLanguage: [
      "individual freedom",
      "personal choice",
      "liberty",
      "autonomy",
      "self-determination"
    ],
    standardTerm: "Individual Freedom and Personal Liberty",
    plainEnglish: "I want to be free to make my own choices and live my life the way I want without undue interference."
  },
  patriotism: {
    plainLanguage: [
      "national pride",
      "patriotism",
      "american values",
      "national identity",
      "american tradition"
    ],
    standardTerm: "Patriotism and National Pride",
    plainEnglish: "I want our country to remain strong and proud, honoring our traditions and working for the common good."
  },
  transportation: {
    plainLanguage: [
      "transportation",
      "transit",
      "public transit",
      "local transportation",
      "affordable transportation",
      "commute",
      "bus",
      "train",
      "subway",
      "infrastructure"
    ],
    standardTerm: "Transportation and Infrastructure",
    plainEnglish: "I want better and more affordable transportation options in my community."
  }
};

const topicKeywords = {
  "taxBurden": ["tax", "taxes", "taxation", "taxpayer", "fiscal", "money", "income", "financial burden"],
  "taxCutsForWealthy": ["wealthy", "corporation", "business", "rich", "job creator", "entrepreneur"],
  "taxWealthyMore": ["wealthy", "rich", "billionaire", "millionaire", "corporation", "1%", "elite"],
  "economy": ["economy", "economic", "financial", "job", "market", "business", "inflation", "price", "cost", "salary"],
  "healthcare": ["health", "medical", "doctor", "hospital", "insurance", "medicine", "prescription", "therapy"],
  "climate": ["climate", "environment", "pollution", "emission", "green", "sustainable", "earth", "planet", "hoax"],
  "immigration": ["immigrant", "border", "migrant", "asylum", "citizenship", "foreign", "visa"],
  "politicalDivision": ["divide", "partisan", "polarization", "unity", "division", "media", "fake", "truth", "jan 6", "january 6", "capitol", "riot", "criminal"],
  "housing": ["house", "home", "rent", "mortgage", "apartment", "homeless", "shelter", "property"],
  "education": ["school", "education", "student", "teacher", "college", "university", "learn", "tuition"],
  "publicSafety": ["police", "crime", "safety", "community", "law", "security", "protection", "violence"],
  "inequality": ["equal", "equality", "gap", "fair", "opportunity", "disparity", "privilege"],
  "technology": ["tech", "technology", "internet", "digital", "computer", "online", "cyber", "data", "privacy", "ai", "artificial intelligence", "robot", "sci-fi", "sci-fy"],
  "foreignPolicy": ["foreign", "international", "global", "world", "ally", "enemy", "diplomacy", "war", "peace", "military"],
  "laborRights": ["worker", "labor", "job", "employee", "union", "workplace", "wage", "salary", "working"],
  "genderEquality": ["woman", "women", "gender", "sex", "feminine", "masculine", "discrimination", "harassment", "race"],
  "civilLiberties": ["right", "freedom", "liberty", "speech", "press", "assembly", "constitution", "law"],
  "reproductiveRights": ["abortion", "choice", "reproductive", "pregnancy", "fetus", "woman", "body"],
  "proLife": ["life", "baby", "unborn", "fetus", "abortion", "conception"],
  "churchAndState": ["religion", "church", "god", "faith", "secular", "prayer", "religious"],
  "lgbtqRights": ["gay", "lesbian", "transgender", "queer", "lgbt", "sexuality", "identity"],
  "traditionalValues": ["traditional", "family", "culture", "heritage", "value", "conservative"],
  "moralValues": ["moral", "ethic", "value", "principle", "virtue", "right", "wrong", "good", "evil"],
  "personalLiberty": ["freedom", "liberty", "choice", "individual", "autonomy", "government control", "restriction"],
  "patriotism": ["america", "american", "usa", "united states", "country", "nation", "patriot", "flag", "respect"],
  "transportation": ["transportation", "transit", "bus", "train", "commute", "subway", "infrastructure", "road", "highway", "travel"]
};

function findBestCategoryMatch(priority: string): { 
  category: string, 
  standardTerm: string, 
  confidence: number, 
  missingTerms: string[],
  nuanceScores?: Record<string, number>
} | null {
  try {
    priority = priority.toLowerCase();
    
    if (priority.includes("affirmative action") || 
        priority.includes("dei") || 
        priority.includes("diversity") || 
        priority.includes("identity politics") ||
        priority.includes("race") && priority.includes("hire")) {
      
      const nuanceScores: Record<string, number> = {
        affirmative_action_income: 0,
        affirmative_action_race: 0,
        DEI_hiring: 0
      };

      if (priority.includes("income") || priority.includes("economic")) {
        nuanceScores.affirmative_action_income = 0.7;
      }
      if (priority.includes("race") || priority.includes("racial")) {
        nuanceScores.affirmative_action_race = priority.includes("against") || priority.includes("oppose") ? -0.6 : 0.6;
      }
      if (priority.includes("dei") || priority.includes("diversity")) {
        nuanceScores.DEI_hiring = priority.includes("against") || priority.includes("oppose") ? -0.4 : 0.4;
      }

      return {
        category: "equalOpportunity",
        standardTerm: "Equal Opportunity and Fairness in Employment",
        confidence: 90,
        missingTerms: [],
        nuanceScores
      };
    }

    let bestCategory = "";
    let bestScore = 0;
    let bestConfidence = 0;
    let bestStandardTerm = "";
    let missingTerms: string[] = [];
    
    const phrases = priority.split(/[.,!?]|\band\b|\bor\b|\bbut\b/)
      .map(p => p.trim())
      .filter(p => p.length > 3);
    
    for (const [category, data] of Object.entries(issueTerminology)) {
      if (category === "issues") continue;
      
      let score = 0;
      const keywords = (data as any).plainLanguage as string[];
      
      for (const keyword of keywords) {
        if (priority.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
      const words = priority.split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && keywords.some(k => k.toLowerCase().includes(word.toLowerCase()))) {
          score += 1;
        }
      }
      
      const confidence = Math.min(100, Math.round((score / Math.max(1, keywords.length)) * 100));
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
        bestConfidence = confidence;
        bestStandardTerm = (data as any).standardTerm;
        
        missingTerms = phrases.filter(phrase => 
          !keywords.some(keyword => 
            keyword.toLowerCase().includes(phrase.toLowerCase()) ||
            phrase.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
    }
    
    if (bestCategory) {
      return {
        category: bestCategory,
        standardTerm: bestStandardTerm,
        confidence: bestConfidence,
        missingTerms: missingTerms.filter(term => term.length > 4)
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error in findBestCategoryMatch:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priorities, mode } = await req.json()
    console.log('Analyzing priorities:', JSON.stringify(priorities))
    
    const mappedPriorities = priorities.map((priority: string, index: number) => {
      try {
        const priorityLower = priority.toLowerCase();
        const matches: Array<{category: string, standardTerm: string, matchCount: number}> = [];
        
        for (const [category, data] of Object.entries(issueTerminology)) {
          if (category === "issues") continue;
          
          const plainLanguageTerms = (data as any).plainLanguage as string[]
          let matchCount = 0;
          
          plainLanguageTerms.forEach(term => {
            if (priorityLower.includes(term.toLowerCase())) {
              matchCount++;
            }
          });
          
          if (matchCount > 0) {
            matches.push({
              category,
              standardTerm: (data as any).standardTerm,
              matchCount
            });
          }
        }
        
        if (matches.length > 0) {
          return {
            originalIndex: index,
            priority,
            matches: matches.sort((a, b) => b.matchCount - a.matchCount),
            nlpMatched: false
          };
        }
        
        const bestMatch = findBestCategoryMatch(priority);
        if (bestMatch) {
          const result: any = {
            originalIndex: index,
            priority,
            matches: [{
              category: bestMatch.category,
              standardTerm: bestMatch.standardTerm,
              matchCount: 1
            }],
            nlpMatched: true,
            confidence: bestMatch.confidence,
            missingTerms: bestMatch.missingTerms
          };
          
          if (bestMatch.nuanceScores) {
            result.nuanceScores = bestMatch.nuanceScores;
          }
          
          return result;
        }
        
        return null;
      } catch (priorityError) {
        console.error("Error processing priority:", priorityError);
        return null;
      }
    }).filter(Boolean);

    const validMappings = mappedPriorities.sort((a, b) => a.originalIndex - b.originalIndex);
    
    const orderedTerms = validMappings.flatMap(mapping => 
      mapping.matches.map(match => match.standardTerm)
    );
    
    const uniqueOrderedTerms = Array.from(new Set(orderedTerms));
    
    const unmappedCount = priorities.length - validMappings.length;

    const missingTermsData = validMappings
      .filter(mapping => mapping.nlpMatched && mapping.missingTerms && mapping.missingTerms.length > 0)
      .map(mapping => ({
        priority: mapping.priority,
        mappedTo: mapping.matches[0].standardTerm,
        confidence: mapping.confidence,
        missingTerms: mapping.missingTerms,
        nuanceScores: mapping.nuanceScores
      }));

    let analysis = "Here are the policy areas identified from your priorities:\n\n";
    
    analysis += uniqueOrderedTerms.map(term => `• ${term}`).join('\n');

    if (unmappedCount > 0) {
      analysis += `\n\n${unmappedCount} of your priorities could not be mapped to policy terms. Feel free to rephrase them if you'd like.`;
    }

    const nlpMatches = validMappings.filter(m => m.nlpMatched);
    if (nlpMatches.length > 0) {
      analysis += "\n\n🔍 Some priorities were matched using advanced analysis:";
      nlpMatches.forEach(match => {
        let matchText = `\n• "${match.priority}" → ${match.matches[0].standardTerm} (confidence: ${match.confidence}%)`;
        if (match.nuanceScores) {
          matchText += "\n  Nuanced position detected:";
          for (const [key, value] of Object.entries(match.nuanceScores)) {
            if (value !== 0) {
              matchText += `\n    - ${key.replace(/_/g, " ")}: ${value > 0 ? "Support" : "Oppose"} (strength: ${Math.abs(value)})`;
            }
          }
        }
        analysis += matchText;
      });
    }

    if (missingTermsData.length > 0) {
      analysis += "\n\n📝 New terminology suggestions:";
      missingTermsData.forEach(item => {
        if (item.missingTerms.length > 0) {
          analysis += `\n• For "${item.mappedTo}": ${item.missingTerms.join(", ")}`;
        }
      });
    }

    console.log('Generated analysis:', analysis);

    return new Response(
      JSON.stringify({
        mode,
        analysis,
        mappedPriorities: validMappings,
        missingTermsData: missingTermsData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )

  } catch (error) {
    console.error('Error in analyze-priorities:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
