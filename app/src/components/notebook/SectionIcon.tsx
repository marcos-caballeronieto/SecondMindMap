'use client'

import React from 'react'
import {
  Info,
  Landmark,
  Sparkles,
  Eye,
  Palette,
  UtensilsCrossed,
  Lightbulb,
  Camera,
  BookOpen,
  LucideProps,
} from 'lucide-react'
import type { SectionKey } from '@/lib/types'

interface SectionIconProps extends LucideProps {
  sectionKey: SectionKey
}

export function SectionIcon({ sectionKey, ...props }: SectionIconProps) {
  switch (sectionKey) {
    case 'general_info':
      return <Info {...props} />
    case 'history':
      return <Landmark {...props} />
    case 'curiosities':
      return <Sparkles {...props} />
    case 'highlights':
      return <Eye {...props} />
    case 'art_pieces':
      return <Palette {...props} />
    case 'food_specialties':
      return <UtensilsCrossed {...props} />
    case 'practical_tips':
      return <Lightbulb {...props} />
    case 'photo_spots':
      return <Camera {...props} />
    case 'personal_notes':
      return <BookOpen {...props} />
    default:
      return <Info {...props} />
  }
}

