import Anthropic from 'anthropic'

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANG: Record<string,string> = { en:'English', de:'German', fr:'French', ar:'Arabic', es:'Spanish', pt:'Portuguese', it:'Italian', nl:'Dutch' }
const LEN: Record<string,string> = { Short:'80-120 words', Medium:'180-250 words', Long:'300-400 words' }

export interface VoiceDNA {
  style: string; hookStyle: string; emojiUsage: string
  avgSentenceLen: string; phrases: string; formality: string
}

export async function generateVariations(topic: string, tone: string, lang: string, length: string, dna?: VoiceDNA|null, samples?: string) {
  const langName = LANG[lang] || 'English'
  const words = LEN[length] || '180-250 words'

  const voiceBlock = dna ? `
VOICE DNA - Match this writing fingerprint EXACTLY:
• Style: ${dna.style}
• Hook style: ${dna.hookStyle}
• Emoji usage: ${dna.emojiUsage}
• Avg sentence length: ${dna.avgSentenceLen}
• Signature phrases (weave in naturally): ${dna.phrases}
• Formality level: ${dna.formality}
${samples ? `\nUser writing samples to mimic:\n---\n${samples.slice(0,900)}\n---` : ''}` : 'Write in an authentic, human LinkedIn voice.'

  const sys = `You are LinkedKraft, an elite LinkedIn ghostwriter. You write posts that sound like real humans wrote them - never like AI.

${voiceBlock}

HARD RULES:
- Language: ${langName} ONLY
- Length: ${words}
- NO: "game-changer", "leverage", "synergy", "In today's world", "fast-paced", "passionate about"
- Short paragraphs (1-3 lines) for mobile
- Vary sentence lengths naturally
- Sound like a specific real person, not a brand
- Return ONLY valid JSON, zero markdown`

  const prompt = `Topic: "${topic}"
Tone: ${tone}

Write 3 LinkedIn post variations. Return ONLY this JSON:
{
  "variations": [
    {"type":"story","label":"📖 Story","text":"post with real \\n linebreaks","hookScore":88,"readScore":85,"emotScore":82,"ctaScore":75},
    {"type":"insight","label":"💡 Insight","text":"post","hookScore":79,"readScore":87,"emotScore":73,"ctaScore":83},
    {"type":"opinion","label":"🔥 Bold Take","text":"post","hookScore":93,"readScore":81,"emotScore":89,"ctaScore":68}
  ]
}

Story: personal narrative, vulnerability, emotional arc, specific moment
Insight: contrarian or counterintuitive point, clear framework, actionable
Bold Take: controversial, challenges conventional wisdom, invites debate

Different opening hook for each. Scores realistic 60-97 range.`

  const res = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: sys,
    messages: [{ role: 'user', content: prompt }]
  })

  const txt = (res.content[0] as any).text?.replace(/```json|```/g,'').trim()
  return JSON.parse(txt).variations
}

export async function analyzeVoice(samples: string): Promise<VoiceDNA> {
  const res = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{ role:'user', content: `Analyze this writing. Return ONLY JSON:
{"style":"e.g. Analytical Storyteller","hookStyle":"e.g. Bold statement","emojiUsage":"Minimal|Moderate|Heavy","avgSentenceLen":"e.g. 9 words","phrases":"e.g. 'Here's the thing', 'Most people'","formality":"Casual|Semi-formal|Formal"}

Writing:
---
${samples.slice(0,1500)}
---` }]
  })
  const txt = (res.content[0] as any).text?.replace(/```json|```/g,'').trim()
  return JSON.parse(txt)
}

export async function generateReplies(comment: string, context: string, dna?: VoiceDNA|null) {
  const voice = dna ? `Write in this voice: ${dna.style}, ${dna.formality} formality, ${dna.emojiUsage} emoji.` : 'Warm, professional, authentic.'
  const res = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 700,
    messages: [{ role:'user', content: `LinkedIn ghostwriter. ${voice}

Comment received: "${comment}"
${context ? `Post was about: "${context}"` : ''}

3 reply options. ONLY JSON:
{"replies":[{"style":"Thoughtful","text":"..."},{"style":"Playful","text":"..."},{"style":"Direct","text":"..."}]}` }]
  })
  const txt = (res.content[0] as any).text?.replace(/```json|```/g,'').trim()
  return JSON.parse(txt).replies
}

export async function repurposeContent(content: string, tone: string, dna?: VoiceDNA|null) {
  const voice = dna ? `Voice: ${dna.style}.` : ''
  const res = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role:'user', content: `Repurpose into 3 LinkedIn posts (${tone} tone). ${voice}

Content:
---
${content.slice(0,2000)}
---

ONLY JSON: {"posts":[{"num":1,"text":"post with \\n linebreaks"},{"num":2,"text":"..."},{"num":3,"text":"..."}]}` }]
  })
  const txt = (res.content[0] as any).text?.replace(/```json|```/g,'').trim()
  return JSON.parse(txt).posts
}
