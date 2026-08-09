import {
  Component, OnInit, OnDestroy, inject, signal, computed,
  Pipe, PipeTransform, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResonatorsApi } from '../resonators/api/resonators.api';
import type { ICharacter } from '../../shared/interfaces';
import { ECharacterElementType } from '../../shared/enums';

// ===== COST CONFIG =====
const STANDARD_BANNER_IDS = new Set([1301, 1404, 1302, 1203, 1405, 1503]); // Calcharo, Jiyan, Yinlin, Encore, Jianxin, Verina

export function isFreeChar(r: ICharacter): boolean {
  return r.name.includes('Rover') || r.rank === 4 || STANDARD_BANNER_IDS.has(r.id);
}

export interface SlotConfig {
  char: ICharacter | null;
  rc: number;    // 0–6, only used if !isFreeChar
  wpn: number;   // 0–5
  buff: boolean; // +0.5 cost bonus
}

function emptySlot(): SlotConfig { return { char: null, rc: 0, wpn: 0, buff: false }; }

export function calcSlotCost(slot: SlotConfig, seasonal = false, seasonalCostFn?: (name: string, rc: number) => number): number {
  if (!slot.char) return 0;
  let rcCost: number;
  if (seasonal && seasonalCostFn) {
    rcCost = seasonalCostFn(slot.char.name, slot.rc);
  } else {
    rcCost = isFreeChar(slot.char) ? 0 : (slot.rc + 1);
  }
  const buffBonus = slot.buff ? 0.5 : 0;
  return rcCost + slot.wpn + buffBonus;
}

export function calcRowCost(slots: SlotConfig[], seasonal = false, seasonalCostFn?: (name: string, rc: number) => number): number {
  return slots.reduce((sum, s) => sum + calcSlotCost(s, seasonal, seasonalCostFn), 0);
}

@Pipe({ name: 'resolveImage', standalone: true })
export class ResolveImagePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value || '/placeholder.svg';
  }
}

export type Phase =
  | 'idle'
  | 'ban1a' | 'ban2a'
  | 'ban1b' | 'ban2b'
  | 'pick1a' | 'pick2a'
  | 'pick1b' | 'pick2b'
  | 'ban2c' | 'ban1c'
  | 'pick2c' | 'pick1c'
  | 'pick2d' | 'pick1d'
  | 'done';

const PHASE_PICKS: Record<string, number> = {
  pick1a: 1, pick2a: 2,
  pick1b: 2, pick2b: 1,
  pick2c: 1, pick1c: 2,
  pick2d: 2, pick1d: 1,
};

const PHASE_ORDER: Phase[] = [
  'idle',
  'ban1a', 'ban2a', 'ban1b', 'ban2b',
  'pick1a', 'pick2a', 'pick1b', 'pick2b',
  'ban2c', 'ban1c',
  'pick2c', 'pick1c', 'pick2d', 'pick1d',
  'done',
];

const BAN_TIME = 45;

function pickTime(phase: string): number {
  const count = PHASE_PICKS[phase] ?? 1;
  return count * 45;
}

const TRANSITION_DELAY = 1000;

interface BattleSnapshot {
  phase: Phase;
  p1picks: ICharacter[];
  p2picks: ICharacter[];
  p1bans: ICharacter[];
  p2bans: ICharacter[];
  phasePickCount: number;
}

interface SavedSlot {
  charName: string;
  rc: number;
  wpn: number;
  buff: boolean;
  cost: number;
}

interface BattleSession {
  id: string;
  date: string;
  player1Name: string;
  player2Name: string;
  p1picks: string[];
  p2picks: string[];
  p1bans: string[];
  p2bans: string[];
  // Cost calculator data
  p1Slots: (SavedSlot | null)[];
  p2Slots: (SavedSlot | null)[];
  p1Budget: [number, number];
  p2Budget: [number, number];
  p1Row1Remaining: number;
  p1Row2Remaining: number;
  p2Row1Remaining: number;
  p2Row2Remaining: number;
  p1Total: number;
  p2Total: number;
}

const STORAGE_KEY = 'battle_history';

// ===== SEASONAL RC COST TABLE =====
// Key: normalized character name (lowercase, no spaces/special chars)
// Value: [S0, S1, S2, S3]
const SEASONAL_RC_COST: Record<string, [number, number, number, number]> = {
  'aemeath':          [1, 2, 5, 7],
  'luukherssen':      [1,   2,   4.5, 6  ],
  'chồngiu':          [1,   2,   4.5, 6  ],
  'chisa':            [1.5, 2,   4.5, 5  ],
  'lupa':             [1,   1.5, 4,   5  ],
  'mornye':           [1,   2,   3.5, 5  ],
  'lynae':            [1,   1.5, 3.5, 4  ],
  'qiuyuan':          [1,   2,   3,   4  ],
  'galbrena':         [1.5, 3,   4.5, 6.5],
  'iuno':             [1,   2,   4,   6.5],
  'augusta':          [1,   2,   4,   6  ],
  'phrolova':         [1,   2,   4,   6  ],
  'cartethyia':       [1,   2,   5,   6.5],
  'ciaccona':         [1,   1.5, 4,   4.5],
  'zani':             [1,   2,   3.5, 5  ],
  'cantarella':       [1,   1.5, 2.5, 4  ],
  'brant':            [1,   2,   3,   5  ],
  'phoebe':           [1,   1.5, 3,   3.5],
  'roccia':           [1,   1.5, 2,   2.5],
  'carlotta':         [1,   2,   4,   5  ],
  'camellya':         [1,   2,   3.5, 4.5],
  'xiangliyao':       [1,   1.5, 2,   3  ],
  'zhezhi':           [1,   1.5, 2,   3  ],
  'changli':          [1,   2,   4,   5  ],
  'yinlin':           [1,   1.5, 1.5, 2  ],
  'jiyan':            [1,   1.5, 2,   3.5],
  'jianxin':          [0,   0,   0,   0  ],
  'calcharo':         [0,   0,   0,   0  ],
  'encore':           [0,   0,   0,   0  ],
  'lingyang':         [0,   0,   0,   0  ],
  'verina':           [0,   0,   0.5, 0.5],
  'shorekeeper':      [1,   1.5, 3,   4  ],
  'jinhsi':           [1,   2,   3,   3.5],
  'sigrika':          [1,   3,   4,   6  ],
  'hiyuki':           [1,   2.5, 5,   7  ],
  'denia':            [1,   2,   3,   5  ],
  'lucy':             [1,   2,   4,   6  ],
  'rebecca':          [1,   2,   3,   4.5],
  'lucilla':          [1,   2,   3.5, 4  ],
  'yangyang':         [1.5, 2.5, 5,   6  ],
  'yangyanggxuanling':[1.5, 2.5, 5,   6  ],
  'suisui':           [1,   2,   3.5, 4  ],
  // common names used in DB
  'xiangli yao':      [1,   1.5, 2,   3  ],
  'luuk herssen':     [1,   2,   4.5, 6  ],
  'yangyang: xuanling':[1.5,2.5, 5,   6  ],
};

function normalizeCharName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]/g, '');
}

function getSeasonalCost(name: string, rc: number): number {
  const key = normalizeCharName(name);
  // Try normalized key first, then original lowercased
  const costs = SEASONAL_RC_COST[key] ?? SEASONAL_RC_COST[name.toLowerCase()];
  if (!costs) return 1; // default fallback
  const idx = Math.min(Math.max(rc, 0), 3) as 0 | 1 | 2 | 3;
  return costs[idx];
}

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule, FormsModule, ResolveImagePipe],
  providers: [ResonatorsApi],
  templateUrl: './battle.component.html',
  styleUrl: './battle.component.scss',
})
export class BattleComponent implements OnInit, OnDestroy {
  private api = inject(ResonatorsApi);
  private platformId = inject(PLATFORM_ID);
  private timerRef: ReturnType<typeof setInterval> | null = null;

  allResonators = signal<ICharacter[]>([]);
  allBans = signal<ICharacter[]>([]);

  p1name = 'Player 1';
  p2name = 'Player 2';
  p1picks = signal<ICharacter[]>([]);
  p2picks = signal<ICharacter[]>([]);
  p1bans = signal<ICharacter[]>([]);
  p2bans = signal<ICharacter[]>([]);

  phase = signal<Phase>('idle');
  timeLeft = signal(BAN_TIME);
  transitioning = signal(false);
  phasePickCount = signal(0);

  searchName = signal('');
  filterElement = signal<ECharacterElementType | ''>('');

  showEditP1 = signal(false);
  showEditP2 = signal(false);
  editNameP1 = '';
  editNameP2 = '';

  showHistory = signal(false);
  history = signal<BattleSession[]>([]);
  saveSuccess = signal(false);

  opened = signal(false);
  showBanAlert = signal(false);
  selectedId = signal<number | null>(null);

  // Undo — plain array + reactive counter
  undoStack: BattleSnapshot[] = [];
  undoCount = signal(0);
  canUndo = computed(() => this.undoCount() > 0);

  // ===== SEASONAL MODE & RC SELECTORS =====
  seasonalMode = signal(false);
  // RC level per pick slot: key = character id, value = 0..3
  p1RcMap = signal<Record<number, number>>({});
  p2RcMap = signal<Record<number, number>>({});

  rcOptions = [
    { label: 'S0', value: 0 },
    { label: 'S1', value: 1 },
    { label: 'S2', value: 2 },
    { label: 'S3', value: 3 },
  ];

  setRc(player: 1 | 2, charId: number, rc: number): void {
    if (player === 1) {
      this.p1RcMap.update(m => ({ ...m, [charId]: rc }));
    } else {
      this.p2RcMap.update(m => ({ ...m, [charId]: rc }));
    }
  }

  getRc(player: 1 | 2, charId: number): number {
    return player === 1
      ? (this.p1RcMap()[charId] ?? 0)
      : (this.p2RcMap()[charId] ?? 0);
  }

  getCost(player: 1 | 2, char: ICharacter): number {
    if (!this.seasonalMode()) return 1;
    const rc = this.getRc(player, char.id);
    return getSeasonalCost(char.name, rc);
  }

  p1TotalCost = computed(() => {
    if (!this.seasonalMode()) return this.p1picks().length;
    return this.p1picks().reduce((sum, r) => {
      const rc = this.p1RcMap()[r.id] ?? 0;
      return sum + getSeasonalCost(r.name, rc);
    }, 0);
  });

  p2TotalCost = computed(() => {
    if (!this.seasonalMode()) return this.p2picks().length;
    return this.p2picks().reduce((sum, r) => {
      const rc = this.p2RcMap()[r.id] ?? 0;
      return sum + getSeasonalCost(r.name, rc);
    }, 0);
  });

  elements = [
    { code: ECharacterElementType.AERO,     icon: '/elements_icon/Aero.png' },
    { code: ECharacterElementType.ELECTRO,  icon: '/elements_icon/Electro.png' },
    { code: ECharacterElementType.FUSION,   icon: '/elements_icon/Fusion.png' },
    { code: ECharacterElementType.GLACIO,   icon: '/elements_icon/Glacio.png' },
    { code: ECharacterElementType.HAVOC,    icon: '/elements_icon/Havoc.png' },
    { code: ECharacterElementType.SPECTRO,  icon: '/elements_icon/Spectro.png' },
  ];

  pickedIds = computed(() => new Set([
    ...this.p1picks().map(r => r.id),
    ...this.p2picks().map(r => r.id),
  ]));

  bannedIds = computed(() => new Set([
    ...this.allBans().map(r => r.id),
    ...this.p1bans().map(r => r.id),
    ...this.p2bans().map(r => r.id),
  ]));

  available = computed(() => {
    const search = this.searchName().toLowerCase();
    const el = this.filterElement();
    return this.allResonators().filter(r => {
      if (this.bannedIds().has(r.id)) return false;
      if (search && !r.name.toLowerCase().includes(search)) return false;
      if (el && r.element !== el) return false;
      return true;
    });
  });

  isP1Turn = computed(() =>
    ['ban1a','ban1b','ban1c','pick1a','pick1b','pick1c','pick1d'].includes(this.phase()));
  isP2Turn = computed(() =>
    ['ban2a','ban2b','ban2c','pick2a','pick2b','pick2c','pick2d'].includes(this.phase()));
  isBanPhase  = computed(() => this.phase().startsWith('ban'));
  isPickPhase = computed(() => this.phase().startsWith('pick'));

  currentPhaseTime = computed(() => {
    const p = this.phase();
    return p.startsWith('ban') ? BAN_TIME : pickTime(p);
  });

  phaseLabel = computed(() => {
    const p = this.phase();
    if (p === 'idle') return '';
    if (p === 'done') return 'Kết thúc';
    const who = this.isP1Turn() ? this.p1name : this.p2name;
    if (p.startsWith('ban')) return `${who} — BAN`;
    const count = PHASE_PICKS[p] ?? 1;
    return `${who} — PICK (${count - this.phasePickCount()} còn lại)`;
  });

  timerColor = computed(() => {
    const pct = this.timeLeft() / this.currentPhaseTime();
    if (pct <= 0.1) return '#ef4444';
    if (pct <= 0.25) return '#f97316';
    return '#60a5fa';
  });

  timerPercent = computed(() => (this.timeLeft() / this.currentPhaseTime()) * 100);

  // Slot arrays
  allBanSlots  = computed(() => Array.from({ length: 6 }, (_, i) => this.allBans()[i]  ?? null));
  p1BanSlots   = computed(() => Array.from({ length: 3 }, (_, i) => this.p1bans()[i]  ?? null));
  p2BanSlots   = computed(() => Array.from({ length: 3 }, (_, i) => this.p2bans()[i]  ?? null));
  p1PickSlots  = computed(() => Array.from({ length: 6 }, (_, i) => this.p1picks()[i] ?? null));
  p2PickSlots  = computed(() => Array.from({ length: 6 }, (_, i) => this.p2picks()[i] ?? null));

  // ===== LIFECYCLE =====
  ngOnInit(): void {
    this.api.getAll().subscribe(list => this.allResonators.set(list));
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.history.set(JSON.parse(raw));
    }
  }

  ngOnDestroy(): void { this.clearTimer(); }

  // ===== UNDO =====
  private snapshot(): BattleSnapshot {
    return {
      phase: this.phase(),
      p1picks: [...this.p1picks()],
      p2picks: [...this.p2picks()],
      p1bans:  [...this.p1bans()],
      p2bans:  [...this.p2bans()],
      phasePickCount: this.phasePickCount(),
    };
  }

  private pushUndo(): void {
    this.undoStack.push(this.snapshot());
    this.undoCount.set(this.undoStack.length);
  }

  undo(): void {
    const snap = this.undoStack.pop();
    if (!snap) return;
    this.undoCount.set(this.undoStack.length);
    this.clearTimer();
    this.transitioning.set(false);
    this.showBanAlert.set(false);
    this.selectedId.set(null);
    this.phase.set(snap.phase);
    this.p1picks.set(snap.p1picks);
    this.p2picks.set(snap.p2picks);
    this.p1bans.set(snap.p1bans);
    this.p2bans.set(snap.p2bans);
    this.phasePickCount.set(snap.phasePickCount);
    if (snap.phase !== 'done' && snap.phase !== 'idle') {
      const time = snap.phase.startsWith('ban') ? BAN_TIME : pickTime(snap.phase);
      this.timeLeft.set(time);
      this.startTimer();
    }
  }

  // ===== START / RESET =====
  startBattle(): void {
    this.undoStack = [];
    this.undoCount.set(0);
    this.opened.set(true);
    setTimeout(() => this.goToPhase('ban1a'), 600);
  }

  resetBattle(): void {
    this.clearTimer();
    this.undoStack = [];
    this.undoCount.set(0);
    this.phase.set('idle');
    this.opened.set(false);
    this.p1picks.set([]); this.p2picks.set([]);
    this.p1bans.set([]);  this.p2bans.set([]);
    this.allBans.set([]);
    this.phasePickCount.set(0);
    this.transitioning.set(false);
    this.showBanAlert.set(false);
    this.selectedId.set(null);
    this.searchName.set('');
    this.filterElement.set('');
  }

  // ===== PHASE NAVIGATION =====
  private goToPhase(phase: Phase): void {
    this.clearTimer();
    if (phase === 'ban2c') {
      this.showBanAlert.set(true);
      setTimeout(() => {
        this.showBanAlert.set(false);
        this.doGoToPhase(phase);
      }, 2000);
      return;
    }
    this.doGoToPhase(phase);
  }

  private doGoToPhase(phase: Phase): void {
    this.selectedId.set(null);
    this.clearTimer();
    this.phase.set(phase);
    this.phasePickCount.set(0);
    if (phase === 'done') return;
    const time = phase.startsWith('ban') ? BAN_TIME : pickTime(phase);
    this.timeLeft.set(time);
    this.startTimer();
  }

  private startTimer(): void {
    this.timerRef = setInterval(() => {
      const t = this.timeLeft() - 1;
      this.timeLeft.set(t);
      if (t <= 0) this.onTimeUp();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
  }

  private onTimeUp(): void {
    if (this.transitioning()) return;
    this.clearTimer();
    this.pushUndo();
    this.transitioning.set(true);
    setTimeout(() => {
      this.transitioning.set(false);
      this.advancePhase();
    }, TRANSITION_DELAY);
  }

  // Used after a player action (ban/pick confirmed) — undo already pushed before state change
  private advanceAfterAction(): void {
    if (this.transitioning()) return;
    this.clearTimer();
    this.transitioning.set(true);
    setTimeout(() => {
      this.transitioning.set(false);
      this.advancePhase();
    }, TRANSITION_DELAY);
  }

  private advancePhase(): void {
    const idx = PHASE_ORDER.indexOf(this.phase());
    const next = PHASE_ORDER[idx + 1] ?? 'done';
    this.goToPhase(next);
  }

  // ===== CLICK =====
  onResonatorClick(r: ICharacter): void {
    const p = this.phase();
    if (p === 'idle' || p === 'done' || this.transitioning() || this.showBanAlert()) return;
    if (this.bannedIds().has(r.id)) return;
    if (this.isPickPhase() && this.pickedIds().has(r.id)) return;

    // First click → highlight
    if (this.selectedId() !== r.id) {
      this.selectedId.set(r.id);
      return;
    }

    // Second click → confirm
    // Push undo BEFORE modifying state so snapshot captures pre-action state
    this.pushUndo();
    this.selectedId.set(null);

    if (this.isBanPhase()) {
      if (this.isP1Turn()) this.p1bans.update(b => [...b, r]);
      else                 this.p2bans.update(b => [...b, r]);
      this.advanceAfterAction();
      return;
    }

    if (this.isPickPhase()) {
      if (this.pickedIds().has(r.id)) return;
      if (this.isP1Turn()) this.p1picks.update(b => [...b, r]);
      else                 this.p2picks.update(b => [...b, r]);
      const needed = PHASE_PICKS[p] ?? 1;
      const done = this.phasePickCount() + 1;
      this.phasePickCount.set(done);
      if (done >= needed) this.advanceAfterAction();
    }
  }

  isDisabled(r: ICharacter): boolean {
    if (this.bannedIds().has(r.id)) return true;
    if (this.isPickPhase() && this.pickedIds().has(r.id)) return true;
    return false;
  }

  isBanned(r: ICharacter): boolean   { return this.bannedIds().has(r.id); }
  isPickedAny(r: ICharacter): boolean { return this.pickedIds().has(r.id); }

  // ===== EDIT NAME =====
  openEditP1(): void  { this.editNameP1 = this.p1name; this.showEditP1.set(true); }
  confirmEditP1(): void { if (this.editNameP1.trim()) this.p1name = this.editNameP1.trim(); this.showEditP1.set(false); }
  openEditP2(): void  { this.editNameP2 = this.p2name; this.showEditP2.set(true); }
  confirmEditP2(): void { if (this.editNameP2.trim()) this.p2name = this.editNameP2.trim(); this.showEditP2.set(false); }

  // ===== SAVE / DELETE =====
  saveSession(): void {
    const toSavedSlot = (s: SlotConfig): SavedSlot | null =>
      s.char ? { charName: s.char.name, rc: s.rc, wpn: s.wpn, buff: s.buff, cost: calcSlotCost(s, this.seasonalMode(), getSeasonalCost) } : null;

    const session: BattleSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('vi-VN'),
      player1Name: this.p1name, player2Name: this.p2name,
      p1picks: this.p1picks().map(r => r.name),
      p2picks: this.p2picks().map(r => r.name),
      p1bans:  this.p1bans().map(r => r.name),
      p2bans:  this.p2bans().map(r => r.name),
      p1Slots: this.p1Slots().map(toSavedSlot),
      p2Slots: this.p2Slots().map(toSavedSlot),
      p1Budget: this.p1Budget(),
      p2Budget: this.p2Budget(),
      p1Row1Remaining: this.p1Row1Remaining(),
      p1Row2Remaining: this.p1Row2Remaining(),
      p2Row1Remaining: this.p2Row1Remaining(),
      p2Row2Remaining: this.p2Row2Remaining(),
      p1Total: this.p1Total(),
      p2Total: this.p2Total(),
    };
    const updated = [session, ...this.history()].slice(0, 20);
    this.history.set(updated);
    if (isPlatformBrowser(this.platformId))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 2000);
  }

  deleteSession(id: string): void {
    const updated = this.history().filter(s => s.id !== id);
    this.history.set(updated);
    if (isPlatformBrowser(this.platformId))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  // ===== FILTER =====
  setFilter(el: ECharacterElementType | ''): void {
    this.filterElement.set(this.filterElement() === el ? '' : el);
  }

  // ===== ICONS =====
  iconOf(r: ICharacter): string     { return r.icon.replace('https://api.encore.moe/resource/Data', '') || '/placeholder.svg'; }
  iconOfPick(r: ICharacter): string {
    if (r.name.includes('Rover')) return '/ban-pick/Rover.jpg';
    return '/ban-pick/' + r.name.replace(':', '') + '.jpg';
  }

  // ===== COST CALCULATOR =====
  // Row 1 = 3 slots [0,1,2], Row 2 = 3 slots [3,4,5]
  p1Slots = signal<SlotConfig[]>([0,1,2,3,4,5].map(() => emptySlot()));
  p2Slots = signal<SlotConfig[]>([0,1,2,3,4,5].map(() => emptySlot()));

  // Budget per row: index 0 = team1 row, index 1 = team2 row
  p1Budget = signal<[number, number]>([6000, 6000]);
  p2Budget = signal<[number, number]>([6000, 6000]);

  p1Row1 = computed(() => this.p1Slots().slice(0, 3));
  p1Row2 = computed(() => this.p1Slots().slice(3, 6));
  p2Row1 = computed(() => this.p2Slots().slice(0, 3));
  p2Row2 = computed(() => this.p2Slots().slice(3, 6));

  p1Row1Cost = computed(() => calcRowCost(this.p1Row1(), this.seasonalMode(), getSeasonalCost) * 1000);
  p1Row2Cost = computed(() => calcRowCost(this.p1Row2(), this.seasonalMode(), getSeasonalCost) * 1000);
  p2Row1Cost = computed(() => calcRowCost(this.p2Row1(), this.seasonalMode(), getSeasonalCost) * 1000);
  p2Row2Cost = computed(() => calcRowCost(this.p2Row2(), this.seasonalMode(), getSeasonalCost) * 1000);

  p1Row1Remaining = computed(() => this.p1Budget()[0] - this.p1Row1Cost());
  p1Row2Remaining = computed(() => this.p1Budget()[1] - this.p1Row2Cost());
  p2Row1Remaining = computed(() => this.p2Budget()[0] - this.p2Row1Cost());
  p2Row2Remaining = computed(() => this.p2Budget()[1] - this.p2Row2Cost());

  p1Total = computed(() => this.p1Row1Remaining() + this.p1Row2Remaining());
  p2Total = computed(() => this.p2Row1Remaining() + this.p2Row2Remaining());

  updateP1Budget(rowIdx: 0 | 1, val: number): void {
    const b = this.p1Budget();
    this.p1Budget.set(rowIdx === 0 ? [val, b[1]] : [b[0], val]);
  }

  updateP2Budget(rowIdx: 0 | 1, val: number): void {
    const b = this.p2Budget();
    this.p2Budget.set(rowIdx === 0 ? [val, b[1]] : [b[0], val]);
  }

  // Chars already used in row1 — cannot be reselected in row2
  p1Row1Ids = computed(() => new Set(this.p1Row1().map(s => s.char?.id).filter(Boolean) as number[]));
  p1Row2Ids = computed(() => new Set(this.p1Row2().map(s => s.char?.id).filter(Boolean) as number[]));
  p2Row1Ids = computed(() => new Set(this.p2Row1().map(s => s.char?.id).filter(Boolean) as number[]));
  p2Row2Ids = computed(() => new Set(this.p2Row2().map(s => s.char?.id).filter(Boolean) as number[]));

  // Available options for each slot (no duplicate within team, row constraint)
  p1AvailableFor(slotIndex: number): ICharacter[] {
    const picks = this.p1picks();
    const isRow2 = slotIndex >= 3;
    const takenInOtherRow = isRow2 ? this.p1Row1Ids() : this.p1Row2Ids();
    const takenInSameRow = this.p1Slots()
      .slice(isRow2 ? 3 : 0, isRow2 ? 6 : 3)
      .filter((_, i) => i !== (slotIndex % 3))
      .map(s => s.char?.id)
      .filter(Boolean) as number[];

    return picks.filter(r => {
      if (takenInOtherRow.has(r.id)) return false;
      if (takenInSameRow.includes(r.id)) return false;
      return true;
    });
  }

  p2AvailableFor(slotIndex: number): ICharacter[] {
    const picks = this.p2picks();
    const isRow2 = slotIndex >= 3;
    const takenInOtherRow = isRow2 ? this.p2Row1Ids() : this.p2Row2Ids();
    const takenInSameRow = this.p2Slots()
      .slice(isRow2 ? 3 : 0, isRow2 ? 6 : 3)
      .filter((_, i) => i !== (slotIndex % 3))
      .map(s => s.char?.id)
      .filter(Boolean) as number[];

    return picks.filter(r => {
      if (takenInOtherRow.has(r.id)) return false;
      if (takenInSameRow.includes(r.id)) return false;
      return true;
    });
  }

  updateP1Slot(index: number, field: keyof SlotConfig, value: ICharacter | number | string | null): void {
    const slots = [...this.p1Slots()];
    const slot = { ...slots[index] };
    if (field === 'char') {
      slot.char = value as ICharacter | null;
      slot.rc = 0;
      slot.wpn = 0;
      slot.buff = false;
    } else {
      (slot as any)[field] = value;
    }
    slots[index] = slot;
    this.p1Slots.set(slots);
  }

  updateP2Slot(index: number, field: keyof SlotConfig, value: ICharacter | number | string | null): void {
    const slots = [...this.p2Slots()];
    const slot = { ...slots[index] };
    if (field === 'char') {
      slot.char = value as ICharacter | null;
      slot.rc = 0;
      slot.wpn = 0;
      slot.buff = false;
    } else {
      (slot as any)[field] = value;
    }
    slots[index] = slot;
    this.p2Slots.set(slots);
  }

  isFree(r: ICharacter): boolean { return isFreeChar(r); }
  slotCost(s: SlotConfig): number {
    return calcSlotCost(s, this.seasonalMode(), getSeasonalCost);
  }

  // RC dropdown options: seasonal = S0-S3 (0-3), normal = RC0-RC6 (0-6)
  get rcCalcOptions(): number[] {
    return this.seasonalMode() ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6];
  }

  rcCalcLabel(v: number): string {
    return this.seasonalMode() ? `S${v}` : `${v}`;
  }

  onP1CharChange(index: number, charId: string): void {
    const char = charId ? (this.p1picks().find(r => r.id === +charId) ?? null) : null;
    this.updateP1Slot(index, 'char', char);
  }

  onP2CharChange(index: number, charId: string): void {
    const char = charId ? (this.p2picks().find(r => r.id === +charId) ?? null) : null;
    this.updateP2Slot(index, 'char', char);
  }


  // ===== ALL BAN (pre-game) =====
  toggleAllBan(r: ICharacter): void {
    if (this.opened()) return;
    if (this.allBans().some(x => x.id === r.id))
      this.allBans.update(b => b.filter(x => x.id !== r.id));
    else
      this.allBans.update(b => [...b, r]);
  }

  isAllBanned(r: ICharacter): boolean {
    return this.allBans().some(x => x.id === r.id);
  }
}
