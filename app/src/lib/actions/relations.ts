'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { PlaceRelation, RelationType } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getPlaceRelations(): Promise<PlaceRelation[]> {
  if (!isSupabaseConfigured()) {
    return []
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('place_relations')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return []
    }
    return (data ?? []) as PlaceRelation[]
  } catch {
    return []
  }
}

export async function createPlaceRelation(data: {
  place_id: string
  related_place_id: string
  relation_type: RelationType
}): Promise<PlaceRelation | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado')
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: created, error } = await supabase
    .from('place_relations')
    .insert({
      user_id: user.id,
      place_id: data.place_id,
      related_place_id: data.related_place_id,
      relation_type: data.relation_type,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating place relation:', error)
    throw error
  }

  revalidatePath('/')
  return created as PlaceRelation
}

export async function deletePlaceRelation(
  placeId: string,
  relatedPlaceId: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado')
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Delete relation in either direction
  const { error } = await supabase
    .from('place_relations')
    .delete()
    .or(
      `and(place_id.eq.${placeId},related_place_id.eq.${relatedPlaceId}),and(place_id.eq.${relatedPlaceId},related_place_id.eq.${placeId})`
    )

  if (error) {
    console.error('Error deleting place relation:', error)
    throw error
  }

  revalidatePath('/')
}

export async function syncPlaceRelations(
  placeId: string,
  relations: Array<{ related_place_id: string; relation_type: RelationType }>
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  // Delete existing outgoing relations for this place
  await supabase.from('place_relations').delete().eq('place_id', placeId)

  if (relations.length > 0) {
    const rows = relations.map((r) => ({
      user_id: user.id,
      place_id: placeId,
      related_place_id: r.related_place_id,
      relation_type: r.relation_type,
    }))
    await supabase.from('place_relations').insert(rows)
  }

  revalidatePath('/')
}

