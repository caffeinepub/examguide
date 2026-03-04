import type {
  ExamCategory,
  GuidancePost,
  StudyNote,
  TutorMentorProfile,
} from "../backend.d";

export const SAMPLE_EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 1,
    name: "SAT",
    description: "Scholastic Assessment Test for US college admissions",
  },
  {
    id: 2,
    name: "GRE",
    description: "Graduate Record Examinations for graduate school admissions",
  },
  {
    id: 3,
    name: "GMAT",
    description: "Graduate Management Admission Test for business schools",
  },
  {
    id: 4,
    name: "IELTS",
    description: "International English Language Testing System",
  },
  {
    id: 5,
    name: "TOEFL",
    description: "Test of English as a Foreign Language",
  },
  {
    id: 6,
    name: "JEE",
    description: "Joint Entrance Examination for Indian engineering colleges",
  },
  {
    id: 7,
    name: "UPSC",
    description: "Union Public Service Commission civil services exam",
  },
  {
    id: 8,
    name: "LSAT",
    description: "Law School Admission Test for law school admissions",
  },
  {
    id: 9,
    name: "MCAT",
    description: "Medical College Admission Test for medical schools",
  },
  {
    id: 10,
    name: "CFA",
    description: "Chartered Financial Analyst certification exam",
  },
  {
    id: 11,
    name: "CAT",
    description: "Common Admission Test for Indian management institutes",
  },
  {
    id: 12,
    name: "ACT",
    description: "American College Testing for US college admissions",
  },
];

export const SAMPLE_STUDY_NOTES: StudyNote[] = [
  {
    id: 1,
    title: "SAT Math — Quadratic Equations Cheat Sheet",
    content: `## Quadratic Equations — SAT Math

### Standard Form
ax² + bx + c = 0

### Quadratic Formula
x = (-b ± √(b²-4ac)) / 2a

### Discriminant Analysis
- b²-4ac > 0: Two real solutions
- b²-4ac = 0: One real solution  
- b²-4ac < 0: No real solutions

### Vertex Form
y = a(x-h)² + k
Vertex is at (h, k)

### Factoring Tips
1. Find factors of c that add to b
2. (x + p)(x + q) where p+q=b, p×q=c
3. Always check by FOIL expansion

### Common SAT Patterns
- Completing the square
- Sum/product of roots: sum = -b/a, product = c/a
- Parabola vertex on x-axis means discriminant = 0`,
    subject: "Mathematics",
    examCategoryId: 1,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "sample-1" }),
    } as any,
    timestamp: BigInt(Date.now()) * BigInt(1000000),
  },
  {
    id: 2,
    title: "GRE Vocabulary — High-Frequency Words List",
    content: `## GRE High-Frequency Vocabulary

### Tier 1 — Must Know (500+ frequency)

**Aberrant** (adj): Deviating from what is normal
*Example: The scientist's aberrant findings challenged established theory.*

**Acrimony** (n): Bitterness or ill feeling
*Example: The divorce proceedings were filled with acrimony.*

**Alacrity** (n): Brisk and cheerful readiness
*Example: She accepted the offer with alacrity.*

**Ambivalence** (n): Mixed feelings or uncertainty
*Example: His ambivalence about moving abroad was palpable.*

**Ameliorate** (v): To make something bad better
*Example: The new policy ameliorated working conditions.*

**Anachronism** (n): Something out of its proper time
*Example: A typewriter is an anachronism in today's office.*

### Memory Techniques
- Create vivid associations
- Use roots: "acrimo-" relates to "acrid" (sharp/bitter)
- Write sentences in your own context
- Revisit spaced repetition every 3 days`,
    subject: "Verbal Reasoning",
    examCategoryId: 2,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "sample-2" }),
    } as any,
    timestamp: BigInt(Date.now() - 86400000) * BigInt(1000000),
  },
  {
    id: 3,
    title: "IELTS Writing Task 2 — Complete Template Guide",
    content: `## IELTS Writing Task 2 Template

### Structure (250+ words, 40 minutes)

**Introduction (2-3 sentences)**
- Paraphrase the question topic
- State your position clearly
- Preview your main points

**Body Paragraph 1 — Main Argument**
Topic sentence → Explanation → Example → Link back

**Body Paragraph 2 — Counter/Supporting Argument**
Topic sentence → Explanation → Example → Link back

**Conclusion**
- Restate position
- Summarize key points
- No new information!

### Linking Words Bank
*Addition:* Furthermore, Moreover, In addition
*Contrast:* However, Nevertheless, On the other hand
*Result:* Therefore, Consequently, As a result
*Example:* For instance, To illustrate, Such as

### Band 9 Tips
✓ Vary sentence structure (simple, compound, complex)
✓ Use topic-specific vocabulary
✓ Each paragraph = one main idea
✓ Avoid repetition — use synonyms`,
    subject: "English Writing",
    examCategoryId: 4,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "sample-3" }),
    } as any,
    timestamp: BigInt(Date.now() - 172800000) * BigInt(1000000),
  },
  {
    id: 4,
    title: "JEE Physics — Laws of Motion Summary",
    content: `## JEE Physics: Laws of Motion

### Newton's Three Laws

**First Law (Inertia)**
A body remains at rest or in uniform motion unless acted upon by an external force.

**Second Law (F = ma)**
The rate of change of momentum is proportional to applied force.
F = ma (for constant mass)
F = dp/dt (general form)

**Third Law (Action-Reaction)**
Every action has an equal and opposite reaction.

### Key Formulas
- Friction: f = μN
- Static friction: f_s ≤ μ_s × N
- Kinetic friction: f_k = μ_k × N
- Normal force on incline: N = mg cos θ
- Acceleration on incline: a = g(sin θ - μ cos θ)

### Important JEE Concepts
1. Free Body Diagram — Always draw first!
2. Pseudo force in non-inertial frames
3. Connected bodies (Atwood machine)
4. Circular motion — centripetal acceleration = v²/r`,
    subject: "Physics",
    examCategoryId: 6,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "sample-4" }),
    } as any,
    timestamp: BigInt(Date.now() - 259200000) * BigInt(1000000),
  },
];

export const SAMPLE_GUIDANCE_POSTS: GuidancePost[] = [
  {
    id: 1,
    title: "How I Scored 1580 on the SAT in 3 Months — A Complete Study Plan",
    body: `After months of dedicated preparation, I achieved a 1580 on the SAT. Here's the exact strategy I used.

## Month 1: Foundation Building

The first month is about understanding your baseline and identifying weaknesses.

**Week 1-2: Diagnostic**
Take a full-length practice test under real conditions. Analyze every wrong answer — not just what was right, but WHY you missed it. Pattern recognition is key.

**Week 3-4: Core Concepts**
Math: Master algebra fundamentals, then geometry, then advanced math topics. Khan Academy's SAT prep is surprisingly excellent.
Reading: Practice active reading — annotate passages, predict answers before looking at options.

## Month 2: Targeted Practice

Focus 80% of time on your weakest areas. If you scored 600 in Math and 700 in Reading, spend more time on Math.

Practice official College Board tests — these are the closest to the real thing. Third-party materials vary in quality.

## Month 3: Timing and Strategy

Learn timing strategies: 1.2 minutes per reading question, don't spend >2 minutes on any single math problem.

Take 3-4 full practice tests in exam conditions. Sleep 8 hours before each. Track progress weekly.

## Key Takeaways
- Consistency beats cramming every time
- Official materials are irreplaceable
- Review wrong answers more than doing new problems
- Mental stamina is a real skill — train it`,
    examCategoryId: 1,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "guide-1" }),
    } as any,
    timestamp: BigInt(Date.now() - 345600000) * BigInt(1000000),
  },
  {
    id: 2,
    title: "UPSC Prelims Strategy: From Zero to IAS in 14 Months",
    body: `The UPSC Civil Services Examination is one of the most challenging exams in the world. Here's a proven roadmap.

## Understanding the Structure

**Prelims:** Two papers — GS Paper I (objective) and CSAT (qualifying). Focus 80% on GS Paper I.

**Mains:** 9 papers, essay + GS + optional subject. Written answers.

**Interview:** Personality test, 275 marks.

## Study Timeline

**Months 1-3: NCERT Foundation**
Read all NCERT textbooks from Class 6-12 for History, Geography, Polity, Economics, Science. These form the backbone of GS preparation.

**Months 4-8: Standard References**
- History: Bipin Chandra, Spectrum
- Geography: G.C. Leong, NCERT
- Polity: M. Laxmikanth (mandatory!)
- Economy: Ramesh Singh, Economic Survey

**Months 9-12: Current Affairs**
Daily newspaper reading (The Hindu/Indian Express). Monthly magazine compilation. Focus on government schemes, international relations, science & tech.

**Months 13-14: Revision + Mock Tests**

## The Newspaper Habit

The Hindu or Indian Express — 90 minutes daily. Make notes on:
- Government policies and schemes
- International events
- Economic indicators
- Science and technology breakthroughs`,
    examCategoryId: 7,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "guide-2" }),
    } as any,
    timestamp: BigInt(Date.now() - 432000000) * BigInt(1000000),
  },
  {
    id: 3,
    title: "IELTS Band 8+ Speaking Tips: What Examiners Actually Look For",
    body: `After coaching 200+ students to Band 8 in IELTS Speaking, here are the real secrets.

## The Four Scoring Criteria

IELTS Speaking is scored on:
1. **Fluency & Coherence** (25%)
2. **Lexical Resource** (25%) — vocabulary range and accuracy
3. **Grammatical Range & Accuracy** (25%)
4. **Pronunciation** (25%)

## Common Mistakes That Kill Your Score

**Mistake 1: Memorized answers**
Examiners can spot rehearsed answers immediately. They'll change the question or go deeper. Be genuine.

**Mistake 2: Short answers**
Aim to speak 30-45 seconds per Part 1 question without being asked. Use the "Point-Reason-Example" structure.

**Mistake 3: Avoiding complex grammar**
Use conditionals, passive voice, relative clauses naturally. Don't just use simple sentences to be "safe."

## Vocabulary Strategies

Instead of "good" → use: beneficial, advantageous, constructive, rewarding
Instead of "bad" → use: detrimental, counterproductive, problematic, concerning

## Part 2 Cue Card Technique

1. Spend exactly 60 seconds planning (use all the time!)
2. Address ALL bullet points on the card
3. Start with a strong opening: "I'd like to talk about..."
4. Use storytelling — make it personal and vivid
5. End with reflection: "Looking back, what made this special was..."`,
    examCategoryId: 4,
    author: {
      isAnonymous: () => false,
      getPrincipal: () => ({ toString: () => "guide-3" }),
    } as any,
    timestamp: BigInt(Date.now() - 518400000) * BigInt(1000000),
  },
];

export const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp / BigInt(1000000))).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
};
