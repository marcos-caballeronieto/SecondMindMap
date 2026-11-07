import React from 'react'
import {
  Folder,
  Coffee,
  Castle,
  Utensils,
  Landmark,
  Mountain,
  Camera,
  Wine,
  BookOpen,
  Bed,
  Compass,
  Bike,
  Heart,
  Trees,
  Footprints,
  Church,
  ShoppingBag,
  Tag,
} from 'lucide-react'
import type { CollectionIconKey } from '@/lib/types'

interface CollectionIconProps {
  name: CollectionIconKey | string
  size?: number
  className?: string
  style?: React.CSSProperties
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Folder,
  Coffee,
  Castle,
  Utensils,
  Landmark,
  Mountain,
  Camera,
  Wine,
  BookOpen,
  Bed,
  Compass,
  Bike,
  Heart,
  Trees,
  Footprints,
  Church,
  ShoppingBag,
}

export function CollectionIcon({ name, size = 16, className, style }: CollectionIconProps) {
  const IconComponent = ICON_MAP[name] ?? Tag
  return <IconComponent size={size} className={className} style={style} />
}

