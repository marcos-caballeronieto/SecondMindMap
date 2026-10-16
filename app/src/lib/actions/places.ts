'use server'

import { createClient } from '@/lib/supabase/server'
import { PlaceInsert, PlaceUpdate } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getPlaces() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPlace(place: PlaceInsert) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('places')
    .insert({ ...place, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  revalidatePath('/')
  return data
}

export async function updatePlace(id: string, place: PlaceUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('places')
    .update(place)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/')
  return data
}

export async function deletePlace(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('places').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/')
}
