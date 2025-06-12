import { Tables } from '@/types/supabase';
import { LevelHierarchy, LevelGroupItem, LevelItem, ComponentItem } from '@/types/LevelHierarchy'; // yolunu ayarlarsın

export function mapToLevelHierarchy(data: any[]): LevelHierarchy {
  return data.map((group): LevelGroupItem => ({
    id: group.id,
    title: group.title,
    order: group.order,
    levels: (group.levels ?? []).map((level: any): LevelItem => ({
      id: level.id,
      title: level.title,
      icon_key: level.icon_key,
      icon_family: level.icon_family,
      xp_reward: level.xp_reward,
      order: level.order,
      components: (level.components ?? []).map((component: any): ComponentItem => ({
        id: component.id,
        type: component.type,
        display_name: component.component_types?.display_name ?? '',
        content: component.content,
        order: component.order,
      })),
    })),
  }));
}
