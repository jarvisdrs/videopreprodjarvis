import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { type, prompt, outline } = await req.json()

    if (type === 'outline') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional video scriptwriter. Create detailed outlines for video scripts.
Structure your outlines with:
- Title
- Target audience
- Key messages
- Scene breakdown (numbered scenes with brief descriptions)
- Call to action

Keep the outline clear and actionable for video production.`,
          },
          {
            role: 'user',
            content: `Create a detailed video outline for: ${prompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      return NextResponse.json({
        content: completion.choices[0]?.message?.content || '',
      })
    }

    if (type === 'script') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional video scriptwriter. Write complete video scripts with proper formatting.
Include:
- Scene headers
- Visual descriptions
- Dialogue/voiceover text
- Timing suggestions
- Production notes where relevant

Format the script in a clean, professional style suitable for production.`,
          },
          {
            role: 'user',
            content: `Write a complete video script based on this outline:\n\n${outline}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      })

      return NextResponse.json({
        content: completion.choices[0]?.message?.content || '',
      })
    }

    return NextResponse.json(
      { error: 'Invalid generation type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
