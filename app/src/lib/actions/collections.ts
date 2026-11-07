'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { Collection, CollectionInsert, CollectionUpdate, PlaceCollection } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getCollections(): Promise<Collection[]> {
  if (!isSupabaseConfigured()) {
    return []
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return []
    return (data as Collection[]) ?? []
  } catch {
    return []
  }
}

export async function createCollection(collection: CollectionInsert): Promise<Collection> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado en .env.local')
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('collections')
    .insert({ ...collection, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Collection
}

export async function updateCollection(id: string, collection: CollectionUpdate): Promise<Collection> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado en .env.local')
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .update(collection)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Collection
}

export async function deleteCollection(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/')
  } catch {
    // Ignore error if unconfigured
  }
}

export async function getPlaceCollections(): Promise<PlaceCollection[]> {
  if (!isSupabaseConfigured()) {
    return []
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('place_collections')
      .select('place_id, collection_id')
    if (error) return []
    return (data as PlaceCollection[]) ?? []
  } catch {
    return []
  }
}

export async function setPlaceCollections(placeId: string, collectionIds: string[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  try {
    const supabase = await createClient()
    // Delete existing links for this place
    await supabase.from('place_collections').delete().eq('place_id', placeId)

    if (collectionIds.length > 0) {
      const inserts = collectionIds.map((cid) => ({
        place_id: placeId,
        collection_id: cid,
      }))
      const { error } = await supabase.from('place_collections').insert(inserts)
      if (error) throw error
    }
    revalidatePath('/')
  } catch (err) {
    console.error('Error updating place collections:', err)
  }
}

export async function togglePlaceCollection(
  placeId: string,
  collectionId: string,
  shouldAssign: boolean
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  try {
    const supabase = await createClient()
    if (shouldAssign) {
      await supabase.from('place_collections').insert({
        place_id: placeId,
        collection_id: collectionId,
      })
    } else {
      await supabase
        .from('place_collections')
        .delete()
        .eq('place_id', placeId)
        .eq('collection_id', collectionId)
    }
    revalidatePath('/')
  } catch (err) {
    console.error('Error toggling place collection:', err)
  }
}

