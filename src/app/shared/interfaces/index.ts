import type { ECharacterElementType, ECharacterRare, ECharacterWeaponType, EEchoCost, EWeaponRare } from '../enums';

export interface IEchoSet {
  id: number;
  name: string;
  icon: string;
}

export interface IEcho {
  id: number;
  name: string;
  intensity: EEchoCost;
  icon: string;
  set_ids: number[];
}

export interface IWeapon {
  id: number;
  name: string;
  icon: string;
  rarity: number;
  type: ECharacterWeaponType;
}

export interface ICharacter {
  id: number;
  name: string;
  icon: string;
  card: string;
  rank: number;
  release_date: string;
  element: string;
  weapon_type: string;
}

export interface IResonatorChain {
  id: number;
  resonator_id: number;
  index: number;
  name: string;
  description: string;
  icon: string;
}

export interface IKeyValue {
  Key: number;
  Value: number;
}

export interface IStatCharacter {
  Life: number;
  Atk: number;
  Def: number;
}

export interface IItem {
  id: number;
  icon: string;
  rank: number;
  name: string;
  tag: string;
  description: string | null;
  background: string | null;
}

export interface TFilter<T> {
  code: T | 0;
  name: string;
}

export interface IFilterT {
  element: TFilter<ECharacterElementType>[];
  bodyType: TFilter<2 | 3 | 4>[];
  rarity: TFilter<ECharacterRare>[];
  rarity_weapon: TFilter<EWeaponRare>[];
  type: TFilter<ECharacterWeaponType>[];
  echo: TFilter<EEchoCost>[];
  set: TFilter<number>[];
}

export interface IGuide {
  title: string;
  content: string;
  tags: string[];
  thumnail: string;
  resonator_id: number;
  author_id: string;
}

export type ISelectedWeapon = {
  id: number;
  name: string;
  rarity: number;
  icon: string;
  type: string;
  effective?: number;
  note?: string;
};

export type IGuideEcho = {
  id: number;
  name: string;
  intensity: string;
  set_ids: number[];
  icon: string;
  skill_simple_desc: string;
};

export type ISelectedEchoSet = {
  id: number;
  name: string;
  icon: string;
  set_2_desc: string;
  set_3_desc?: string;
  set_5_desc: string;
  condition?: string;
  main_slot?: IGuideEcho;
};

export type Resonator = {
  id: number;
  name: string;
  element: string;
  weapon_type: ECharacterWeaponType;
  rank: number;
  icon: string;
  release_date: string;
};

export interface IReviewGuide {
  id: string;
  title: string;
  created_at: string;
  published: boolean;
  tags: string[];
  resonator_id: number;
  thumnail: string;
}

export interface IGuideDetailBody {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author_id: string;
  created_at: string;
  published: boolean;
  thumnail: string;
  resonator_id: number;
}

export interface IGuideDetail {
  weapons: ISelectedWeapon[];
  echoSets: ISelectedEchoSet[];
  team_composition: {
    note: string;
    team_comb: {
      slot_one?: Resonator;
      slot_two?: Resonator;
      slot_three?: Resonator;
    }[];
  };
  mainStats: { cost?: number; description?: string }[];
  targetStat: {
    target: { name?: string; value?: string }[];
    note: string;
  };
  combatRotation: { description?: string; link?: string }[];
  summary: { link?: string; description?: string };
  prosCons: { pros: string[]; cons: string[] };
  title: string;
  description: string;
  character_tags: string[];
  character_overview: string;
  skill_priority: string[];
  advanced_tech: { title: string; description: string; link: string | string[] }[];
  sub_stat_priority: string[];
  important_note: string;
  conclusion: string;
  thumbnail: string;
}
