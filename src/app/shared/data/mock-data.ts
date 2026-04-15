import { ECharacterElementType, ECharacterWeaponType } from '../enums';

export const elements = [
  { name: 'Spectro', icon: '/elements_icon/Spectro.png', bgColor: 'bg-yellow-500/20', code: ECharacterElementType.SPECTRO },
  { name: 'Havoc', icon: '/elements_icon/Havoc.png', bgColor: 'bg-red-500/20', code: ECharacterElementType.HAVOC },
  { name: 'Glacio', icon: '/elements_icon/Glacio.png', bgColor: 'bg-blue-400/20', code: ECharacterElementType.GLACIO },
  { name: 'Aero', icon: '/elements_icon/Aero.png', bgColor: 'bg-green-400/20', code: ECharacterElementType.AERO },
  { name: 'Fusion', icon: '/elements_icon/Fusion.png', bgColor: 'bg-red-600/20', code: ECharacterElementType.FUSION },
  { name: 'Electro', icon: '/elements_icon/Electro.png', bgColor: 'bg-purple-500/20', code: ECharacterElementType.ELECTRO },
];

export const weapons = [
  { name: 'Sword', icon: '/weapons_icon/sword.png', code: ECharacterWeaponType.SWORD },
  { name: 'Rectifier', icon: '/weapons_icon/rectifier.png', code: ECharacterWeaponType.RECTIFIER },
  { name: 'Broadblade', icon: '/weapons_icon/broadblade.png', code: ECharacterWeaponType.BROAD_BLADE },
  { name: 'Pistols', icon: '/weapons_icon/pistols.png', code: ECharacterWeaponType.PISTOLS },
  { name: 'Gauntlets', icon: '/weapons_icon/gauntlets.png', code: ECharacterWeaponType.GAUNTLETS },
];

export const navigationItems = [
  { id: 'overview', label: 'Tổng Quan' },
  { id: 'echo-sets', label: 'Echo Sets' },
  { id: 'main-stats', label: 'Chỉ Số Chính' },
  { id: 'sub-stats', label: 'Dòng Phụ Hướng Đến' },
  { id: 'target-stats', label: 'Chỉ số Hướng Đến' },
  { id: 'weapons', label: 'Vũ khí đề xuất' },
  { id: 'team-comps', label: 'Đề xuất đội hình' },
  { id: 'skills', label: 'Kĩ năng ưu tiên' },
  { id: 'rotation', label: 'Combat Rotation' },
  { id: 'advanced', label: 'Kĩ năng nâng cao' },
  { id: 'summary', label: 'Tổng kết' },
];
