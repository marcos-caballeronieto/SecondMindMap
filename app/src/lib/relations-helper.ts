import type { Place, PlaceRelation, RelationType } from './types'

export type RelationCategory = 'contains' | 'inside' | 'nearby' | 'related'

export interface ResolvedRelation {
  key: string
  category: RelationCategory
  relationType: RelationType
  direction: 'outgoing' | 'incoming'
  badgeLabel: string
  categoryLabel: string
  categoryDescription: string
  targetPlace: Place
}

export const RELATION_TYPE_CONFIG: Record<
  RelationCategory,
  {
    badgeLabel: string
    categoryLabel: string
    description: string
    iconName: string
    colorVar: string
  }
> = {
  contains: {
    badgeLabel: 'Contiene',
    categoryLabel: 'Lugares en este recinto',
    description: 'Monumentos, fuentes, edificios o rincones ubicados aquí',
    iconName: 'Layers',
    colorVar: 'var(--color-oxblood)',
  },
  inside: {
    badgeLabel: 'Ubicado en',
    categoryLabel: 'Recinto principal',
    description: 'La plaza, parque o complejo en el que se ubica',
    iconName: 'Landmark',
    colorVar: 'var(--color-navy)',
  },
  nearby: {
    badgeLabel: 'Inmediaciones',
    categoryLabel: 'En las inmediaciones',
    description: 'Lugares de interés a corta distancia a pie',
    iconName: 'Footprints',
    colorVar: 'var(--color-moss)',
  },
  related: {
    badgeLabel: 'Relacionado',
    categoryLabel: 'Lugares relacionados',
    description: 'Lugares con conexión histórica, artística o temática',
    iconName: 'Link2',
    colorVar: 'var(--color-ochre)',
  },
}

export function resolvePlaceRelations(
  currentPlaceId: string,
  places: Place[],
  relations: PlaceRelation[]
): ResolvedRelation[] {
  const placesMap = new Map<string, Place>(places.map((p) => [p.id, p]))
  const resolved: ResolvedRelation[] = []
  const seenPlaceIds = new Set<string>()

  for (const rel of relations) {
    if (rel.place_id === currentPlaceId) {
      const target = placesMap.get(rel.related_place_id)
      if (!target || seenPlaceIds.has(target.id)) continue
      seenPlaceIds.add(target.id)

      const category: RelationCategory =
        rel.relation_type === 'contains'
          ? 'contains'
          : rel.relation_type === 'nearby'
            ? 'nearby'
            : 'related'

      resolved.push({
        key: `${rel.place_id}-${rel.related_place_id}-${rel.relation_type}`,
        category,
        relationType: rel.relation_type,
        direction: 'outgoing',
        badgeLabel: RELATION_TYPE_CONFIG[category].badgeLabel,
        categoryLabel: RELATION_TYPE_CONFIG[category].categoryLabel,
        categoryDescription: RELATION_TYPE_CONFIG[category].description,
        targetPlace: target,
      })
    } else if (rel.related_place_id === currentPlaceId) {
      const target = placesMap.get(rel.place_id)
      if (!target || seenPlaceIds.has(target.id)) continue
      seenPlaceIds.add(target.id)

      const category: RelationCategory =
        rel.relation_type === 'contains'
          ? 'inside' // If place A contains currentPlace, currentPlace is inside A
          : rel.relation_type === 'nearby'
            ? 'nearby'
            : 'related'

      resolved.push({
        key: `${rel.place_id}-${rel.related_place_id}-${rel.relation_type}`,
        category,
        relationType: rel.relation_type,
        direction: 'incoming',
        badgeLabel: RELATION_TYPE_CONFIG[category].badgeLabel,
        categoryLabel: RELATION_TYPE_CONFIG[category].categoryLabel,
        categoryDescription: RELATION_TYPE_CONFIG[category].description,
        targetPlace: target,
      })
    }
  }

  return resolved
}

