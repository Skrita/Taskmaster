import OpenAI from 'https://deno.land/x/openai@v4.67.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, description, existingSubtasks = [], comments = [] } = await req.json()

    let prompt = `Task: "${title}"\n`
    if (description) prompt += `Description: "${description}"\n`
    if (existingSubtasks.length > 0) {
      prompt += `Existing subtasks: ${JSON.stringify(existingSubtasks)}\n`
      prompt += `\nSuggest 3-5 additional actionable subtasks. Do not repeat existing ones.`
    } else {
      prompt += `\nGenerate 4-6 concise, actionable subtasks for this task.`
    }
    if (comments.length > 0) {
      prompt += `\nRelevant comments: ${comments.map((c: string) => `"${c}"`).join('; ')}`
    }
    prompt += `\nReturn ONLY a JSON array of strings. Example: ["Subtask 1", "Subtask 2"]`

    const client = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    const subtasks = match ? JSON.parse(match[0]) : []

    return new Response(JSON.stringify({ subtasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
