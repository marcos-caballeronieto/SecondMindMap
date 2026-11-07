'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Place, PlaceInsert, PlaceUpdate } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getPlaces(): Promise<Place[]> {
  if (!isSupabaseConfigured()) {
    return []
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('places')
      .select('*, place_collections(collection_id)')
      .order('created_at', { ascending: false })
    if (error) {
      // Fallback if place_collections table doesn't exist yet in user's remote DB
      const { data: fallbackData } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })
      return (fallbackData ?? []).map((p) => ({ ...p, collection_ids: [] }))
    }
    return (data ?? []).map((p: Record<string, unknown>) => {
      const pc = (p.place_collections as Array<{ collection_id: string }> | undefined) ?? []
      return {
        ...(p as unknown as Place),
        collection_ids: pc.map((item) => item.collection_id),
      }
    })
  } catch {
    return []
  }
}

export async function createPlace(place: PlaceInsert): Promise<Place> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado en .env.local')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { collection_ids, ...placeData } = place

  const { data, error } = await supabase
    .from('places')
    .insert({ ...placeData, user_id: user.id })
    .select()
    .single()
  if (error) throw error

  if (collection_ids && collection_ids.length > 0) {
    try {
      const inserts = collection_ids.map((cid) => ({
        place_id: data.id,
        collection_id: cid,
      }))
      await supabase.from('place_collections').insert(inserts)
    } catch (pcErr) {
      console.error('Failed to link place collections on create:', pcErr)
    }
  }

  revalidatePath('/')
  return {
    ...data,
    collection_ids: collection_ids ?? [],
  }
}

export async function updatePlace(id: string, place: PlaceUpdate): Promise<Place> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado en .env.local')
  }
  const supabase = await createClient()
  const { collection_ids, ...placeData } = place

  let updatedPlace = null

  if (Object.keys(placeData).length > 0) {
    const { data, error } = await supabase
      .from('places')
      .update(placeData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    updatedPlace = data
  } else {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    updatedPlace = data
  }

  if (collection_ids !== undefined) {
    try {
      await supabase.from('place_collections').delete().eq('place_id', id)
      if (collection_ids.length > 0) {
        const inserts = collection_ids.map((cid) => ({
          place_id: id,
          collection_id: cid,
        }))
        await supabase.from('place_collections').insert(inserts)
      }
    } catch (pcErr) {
      console.error('Failed to update place collections:', pcErr)
    }
  }

  revalidatePath('/')
  return {
    ...updatedPlace,
    collection_ids: collection_ids !== undefined ? collection_ids : [],
  }
}

export async function deletePlace(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('places').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/')
  } catch {
    // Ignore error if unconfigured
  }
}
