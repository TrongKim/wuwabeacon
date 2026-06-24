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
  | 'ban1a'  // P1 bans 1
  | 'ban2a'  // P2 bans 1
  | 'ban1b'  // P1 bans 1
  | 'ban2b'  // P2 bans 1
  | 'pick1a' // P1 picks 1
  | 'pick2a' // P2 picks 2
  | 'pick1b' // P1 picks 2
  | 'pick2b' // P2 picks 2
  | 'pick1c' // P1 picks 2
  | 'pick2c' // P2 picks 2
  | 'pick1d' // P1 picks 1
  | 'done';

// How many picks each phase allows
const PHASE_PICKS: Record<string, number> = {
  pick1a: 1, pick2a: 2, pick1b: 2, pick2b: 2, pick1c: 2, pick2c: 2, pick1d: 1
};

// Phase sequence
const PHASE_ORDER: Phase[] = [
  'idle',
  'ban1a', 'ban2a', 'ban1b', 'ban2b',
  'pick1a', 'pick2a', 'pick1b', 'pick2b', 'pick1c', 'pick2c', 'pick1d',
  'done',
];

interface BattleSession {
  id: string; date: string;
  player1Name: string; player2Name: string;
  p1picks: string[]; p2picks: string[];
  p1bans: string[]; p2bans: string[];
}

const STORAGE_KEY = 'battle_history';
const BAN_TIME = 30;
const PICK_TIME = 30;
const TRANSITION_DELAY = 2000;

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
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  allResonators = signal<ICharacter[]>([]);
  allBans = signal<ICharacter[]>([]); // pre-game all bans

  p1name = 'Player 1';
  p2name = 'Player 2';
  p1picks = signal<ICharacter[]>([]);
  p2picks = signal<ICharacter[]>([]);
  p1bans = signal<ICharacter[]>([]);
  p2bans = signal<ICharacter[]>([]);

  phase = signal<Phase>('idle');
  timeLeft = signal(BAN_TIME);
  transitioning = signal(false);
  phasePickCount = signal(0); // picks made in current pick phase

  searchName = signal('');
  filterElement = signal<ECharacterElementType | ''>('');

  showEditP1 = signal(false);
  showEditP2 = signal(false);
  editNameP1 = '';
  editNameP2 = '';

  showHistory = signal(false);
  history = signal<BattleSession[]>([]);
  saveSuccess = signal(false);

  opened = signal(false); // animation: false=start button, true=full UI

  elements = [
    { code: ECharacterElementType.AERO, icon: '/elements_icon/Aero.png' },
    { code: ECharacterElementType.ELECTRO, icon: '/elements_icon/Electro.png' },
    { code: ECharacterElementType.FUSION, icon: '/elements_icon/Fusion.png' },
    { code: ECharacterElementType.GLACIO, icon: '/elements_icon/Glacio.png' },
    { code: ECharacterElementType.HAVOC, icon: '/elements_icon/Havoc.png' },
    { code: ECharacterElementType.SPECTRO, icon: '/elements_icon/Spectro.png' },
  ];

  // IDs already used (picked by either side)
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

  // Which player is currently active
  isP1Turn = computed(() => ['ban1a','ban1b','pick1a','pick1b','pick1c', 'pick1d'].includes(this.phase()));
  isP2Turn = computed(() => ['ban2a','ban2b','pick2a','pick2b','pick2c'].includes(this.phase()));
  isBanPhase = computed(() => this.phase().startsWith('ban'));
  isPickPhase = computed(() => this.phase().startsWith('pick'));

  phaseLabel = computed(() => {
    const p = this.phase();
    if (p === 'idle') return '';
    if (p === 'done') return 'Kết thúc';
    if (p.startsWith('ban')) {
      const who = this.isP1Turn() ? this.p1name : this.p2name;
      return `${who} — BAN`;
    }
    const who = this.isP1Turn() ? this.p1name : this.p2name;
    const count = PHASE_PICKS[p] ?? 1;
    return `${who} — PICK (${count - this.phasePickCount()} còn lại)`;
  });

  ngOnInit(): void {
    this.api.getAll().subscribe(list => this.allResonators.set(list));
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.history.set(JSON.parse(raw));
    }
  }

  ngOnDestroy(): void { this.clearTimer(); }

  // ===== START =====
  startBattle(): void {
    this.opened.set(true);
    setTimeout(() => this.goToPhase('ban1a'), 600);
  }

  private goToPhase(phase: Phase): void {
    this.clearTimer();
    this.phase.set(phase);
    this.phasePickCount.set(0);
    if (phase === 'done') return;
    const time = phase.startsWith('ban') ? BAN_TIME : PICK_TIME;
    this.timeLeft.set(time);
    this.startTimer();
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const t = this.timeLeft() - 1;
      this.timeLeft.set(t);
      if (t <= 0) this.onTimeUp();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  private onTimeUp(): void {
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

  // ===== CLICK TO BAN/PICK =====
  onResonatorClick(r: ICharacter): void {
    const p = this.phase();
    if (p === 'idle' || p === 'done' || this.transitioning()) return;
    if (this.bannedIds().has(r.id)) return;

    if (this.isBanPhase()) {
      if (this.isP1Turn()) this.p1bans.update(b => [...b, r]);
      else this.p2bans.update(b => [...b, r]);
      this.onTimeUp();
      return;
    }

    if (this.isPickPhase()) {
      // Cannot pick already picked
      if (this.pickedIds().has(r.id)) return;
      const isP1 = this.isP1Turn();
      if (isP1) this.p1picks.update(b => [...b, r]);
      else this.p2picks.update(b => [...b, r]);

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

  isBanned(r: ICharacter): boolean { return this.bannedIds().has(r.id); }
  isPickedAny(r: ICharacter): boolean { return this.pickedIds().has(r.id); }

  // ===== TIMER COLOR =====
  timerColor = computed(() => {
    const t = this.timeLeft();
    if (t <= 5) return '#ef4444';
    if (t <= 10) return '#f97316';
    return '#60a5fa';
  });

  timerPercent = computed(() => {
    const total = this.isBanPhase() ? BAN_TIME : PICK_TIME;
    return (this.timeLeft() / total) * 100;
  });

  // ===== EDIT NAME =====
  openEditP1(): void { this.editNameP1 = this.p1name; this.showEditP1.set(true); }
  confirmEditP1(): void { if (this.editNameP1.trim()) this.p1name = this.editNameP1.trim(); this.showEditP1.set(false); }
  openEditP2(): void { this.editNameP2 = this.p2name; this.showEditP2.set(true); }
  confirmEditP2(): void { if (this.editNameP2.trim()) this.p2name = this.editNameP2.trim(); this.showEditP2.set(false); }

  // ===== SAVE =====
  saveSession(): void {
    const session: BattleSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('vi-VN'),
      player1Name: this.p1name, player2Name: this.p2name,
      p1picks: this.p1picks().map(r => r.name),
      p2picks: this.p2picks().map(r => r.name),
      p1bans: this.p1bans().map(r => r.name),
      p2bans: this.p2bans().map(r => r.name),
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

  setFilter(el: ECharacterElementType | ''): void {
    this.filterElement.set(this.filterElement() === el ? '' : el);
  }

  iconOf(r: ICharacter): string { return r.icon || '/placeholder.svg'; }

  // Slot arrays for UI
  allBanSlots = computed(() => Array.from({ length: 6 }, (_, i) => this.allBans()[i] ?? null));
  p1BanSlots = computed(() => Array.from({ length: 2 }, (_, i) => this.p1bans()[i] ?? null));
  p2BanSlots = computed(() => Array.from({ length: 2 }, (_, i) => this.p2bans()[i] ?? null));
  p1PickSlots = computed(() => Array.from({ length: 6 }, (_, i) => this.p1picks()[i] ?? null));
  p2PickSlots = computed(() => Array.from({ length: 6 }, (_, i) => this.p2picks()[i] ?? null));

  // All ban: pre-game, click to toggle
  toggleAllBan(r: ICharacter): void {
    if (this.opened()) return; // only before start
    if (this.allBans().some(x => x.id === r.id)) {
      this.allBans.update(b => b.filter(x => x.id !== r.id));
    } else {
      this.allBans.update(b => [...b, r]);
    }
  }

  isAllBanned(r: ICharacter): boolean {
    return this.allBans().some(x => x.id === r.id);
  }
}
