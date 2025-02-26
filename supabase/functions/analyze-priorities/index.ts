
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
      "pollution"
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
      "political polarization"
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
      "robots"
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
      "gender discrimination"
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
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priorities, mode } = await req.json()
    console.log('Analyzing priorities:', priorities)
    
    // Remove MAX_MATCHES limit since we want to capture all relevant matches
    const mappedPriorities = priorities.map((priority: string, index: number) => {
      const priorityLower = priority.toLowerCase();
      const matches: Array<{category: string, standardTerm: string, matchCount: number}> = [];
      
      for (const [category, data] of Object.entries(issueTerminology)) {
        const plainLanguageTerms = data.plainLanguage as string[]
        let matchCount = 0;
        
        plainLanguageTerms.forEach(term => {
          if (priorityLower.includes(term.toLowerCase())) {
            matchCount++;
          }
        });
        
        if (matchCount > 0) {
          matches.push({
            category,
            standardTerm: issueTerminology[category].standardTerm,
            matchCount
          });
        }
      }
      
      // Return all matches, sorted by match count
      if (matches.length > 0) {
        return {
          originalIndex: index,
          matches: matches.sort((a, b) => b.matchCount - a.matchCount)
        };
      }
      
      return null;
    });

    const validMappings = mappedPriorities
      .filter(Boolean)
      .sort((a, b) => a.originalIndex - b.originalIndex);
    
    const orderedTerms = validMappings.flatMap(mapping => 
      mapping.matches.map(match => match.standardTerm)
    );
    
    const uniqueOrderedTerms = Array.from(new Set(orderedTerms));
    
    const unmappedCount = priorities.length - validMappings.length;

    let analysis = "Based on all your input, including clarifications, here are the relevant policy areas:\n\n";
    
    analysis += uniqueOrderedTerms.map(term => `• ${term}`).join('\n');

    if (unmappedCount > 0) {
      analysis += `\n\n${unmappedCount} of your priorities could not be mapped to policy terms. Feel free to rephrase them if you'd like.`;
    }

    console.log('Generated analysis:', analysis);

    return new Response(
      JSON.stringify({
        mode,
        analysis,
        mappedPriorities: validMappings
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
