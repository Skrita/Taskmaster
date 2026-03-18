import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

export async function generateSubtasks(
  title: string,
  description: string,
  existingSubtasks: string[] = [],
  comments: string[] = []
): Promise<string[]> {
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY not configured in .env.local')

  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  let prompt = `Task: "${title}"\n`
  if (description) prompt += `Description: "${description}"\n`
  if (existingSubtasks.length > 0) {
    prompt += `Existing subtasks: ${JSON.stringify(existingSubtasks)}\n`
    prompt += `\nSuggest 3-5 additional actionable subtasks. Do not repeat existing ones.`
  } else {
    prompt += `\nGenerate 4-6 concise, actionable subtasks for this task.`
  }
  if (comments.length > 0) {
    prompt += `\nRelevant comments: ${comments.map(c => `"${c}"`).join('; ')}`
  }
  prompt += `\nReturn ONLY a JSON array of strings. Example: ["Subtask 1", "Subtask 2"]`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  return JSON.parse(match[0]) as string[]
}
