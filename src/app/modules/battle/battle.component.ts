import {
  Component, OnInit, OnDestroy, inject, signal, computed,
  Pipe, PipeTransform, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResonatorsApi } from '../resonators/api/resonators.api';
import type { ICharacter } from '../../shared/interfaces';
import { ECharacterElementType } from '../../shared/enums';

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

const BAN_TIME = 30;

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

interface BattleSession {
  id: string;
  date: string;
  player1Name: string;
  player2Name: string;
  p1picks: string[];
  p2picks: string[];
  p1bans: string[];
  p2bans: string[];
}

const STORAGE_KEY = 'battle_history';

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

    // Second click → confirm, push undo first
    this.pushUndo();
    this.selectedId.set(null);

    if (this.isBanPhase()) {
      if (this.isP1Turn()) this.p1bans.update(b => [...b, r]);
      else                 this.p2bans.update(b => [...b, r]);
      this.onTimeUp();
      return;
    }

    if (this.isPickPhase()) {
      if (this.pickedIds().has(r.id)) return;
      if (this.isP1Turn()) this.p1picks.update(b => [...b, r]);
      else                 this.p2picks.update(b => [...b, r]);
      const needed = PHASE_PICKS[p] ?? 1;
      const done = this.phasePickCount() + 1;
      this.phasePickCount.set(done);
      if (done >= needed) this.onTimeUp();
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
    const session: BattleSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('vi-VN'),
      player1Name: this.p1name, player2Name: this.p2name,
      p1picks: this.p1picks().map(r => r.name),
      p2picks: this.p2picks().map(r => r.name),
      p1bans:  this.p1bans().map(r => r.name),
      p2bans:  this.p2bans().map(r => r.name),
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
