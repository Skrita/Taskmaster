import { supabase } from './supabase'

export async function generateSubtasks(
  title: string,
  description: string,
  existingSubtasks: string[] = [],
  comments: string[] = []
): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke('generate-subtasks', {
    body: { title, description, existingSubtasks, comments },
  })

  if (error) throw new Error(error.message)
  return data.subtasks as string[]
}
