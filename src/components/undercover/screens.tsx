import { Eye, EyeOff, Ghost, Lock, Minus, Plus, Trophy, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ROLE_LABEL,
  isValidSetup,
  maxMrWhite,
  maxUndercover,
  type Outcome,
  type Player,
  type Role,
  type WordPair,
} from "@/lib/undercover";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-8">
      {children}
    </main>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{children}</p>
  );
}

/* ---------------------------------- Home --------------------------------- */

export function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-primary/15 blur-2xl" aria-hidden />
          <Ghost className="relative h-20 w-20 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="title-xl text-foreground">Undercover</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Un seul téléphone, des mots secrets et beaucoup de bluff. De 3 à 10 joueurs, hors
            ligne.
          </p>
        </div>
        <Button size="lg" className="w-full text-base font-semibold" onClick={onStart}>
          Démarrer la partie
        </Button>
      </div>
      <ul className="mt-10 space-y-2 text-xs text-muted-foreground">
        <li>• Les civils partagent le même mot.</li>
        <li>• Les undercover ont un mot voisin.</li>
        <li>• Mr White n&apos;a aucun mot… et improvise.</li>
      </ul>
    </Shell>
  );
}

/* ---------------------------------- Setup -------------------------------- */

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="truncate font-semibold">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Diminuer ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center font-display text-2xl">{value}</span>
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Augmenter ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SetupScreen({
  onPlay,
  onBack,
}: {
  onPlay: (players: number, undercover: number, mrWhite: number) => void;
  onBack: () => void;
}) {
  const [players, setPlayers] = useState(5);
  const [undercover, setUndercover] = useState(1);
  const [mrWhite, setMrWhite] = useState(1);

  const clamp = (p: number, u: number, w: number) => {
    const nu = Math.min(u, maxUndercover(p));
    const nw = Math.min(w, maxMrWhite(p, nu));
    setPlayers(p);
    setUndercover(nu);
    setMrWhite(nw);
  };

  const civils = players - undercover - mrWhite;
  const valid = isValidSetup(players, undercover, mrWhite);

  return (
    <Shell>
      <Eyebrow>Étape 1</Eyebrow>
      <h1 className="mt-1 text-4xl">Nombre de joueurs</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Les civils doivent toujours être majoritaires, avec au moins un undercover.
      </p>

      <div className="mt-6 space-y-3">
        <Stepper
          label="Joueurs"
          hint="3 à 10 joueurs"
          value={players}
          min={3}
          max={10}
          onChange={(v) => clamp(v, undercover, mrWhite)}
        />
        <Stepper
          label="Undercover"
          hint="Mot proche de celui des civils"
          value={undercover}
          min={1}
          max={maxUndercover(players)}
          onChange={(v) => clamp(players, v, mrWhite)}
        />
        <Stepper
          label="Mr White"
          hint="Aucun mot secret"
          value={mrWhite}
          min={0}
          max={maxMrWhite(players, undercover)}
          onChange={(v) => clamp(players, undercover, v)}
        />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 p-4 text-sm">
        <Users className="h-4 w-4 shrink-0 text-civil" />
        <span>
          <strong className="font-display text-xl text-civil">{civils}</strong> civils ·{" "}
          <strong className="font-display text-xl text-undercover">{undercover}</strong> undercover
          · <strong className="font-display text-xl text-mrwhite">{mrWhite}</strong> Mr White
        </span>
      </div>

      <div className="mt-auto space-y-3 pt-8">
        <Button
          size="lg"
          className="w-full text-base font-semibold"
          disabled={!valid}
          onClick={() => onPlay(players, undercover, mrWhite)}
        >
          Jouer
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Retour
        </Button>
      </div>
    </Shell>
  );
}

/* ------------------------------- Card board ------------------------------ */

export function CardTile({
  label,
  sub,
  state,
  onClick,
  tone,
}: {
  label: string;
  sub?: string | undefined;
  state: "hidden" | "taken" | "out";
  onClick?: (() => void) | undefined;
  tone?: Role | undefined;
}) {
  const disabled = state !== "hidden" || !onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-2xl border border-border p-2 text-center transition-transform",
        state === "hidden" && "card-back active:scale-95",
        state === "taken" && "bg-card",
        state === "out" && "bg-muted/50 opacity-60",
      )}
    >
      {state === "hidden" ? (
        <>
          <EyeOff className="h-6 w-6 text-primary/80" />
          <span className="font-display text-2xl text-foreground/90">{label}</span>
        </>
      ) : (
        <>
          {state === "out" ? (
            <span className="font-display text-xs uppercase tracking-widest text-destructive">
              Éliminé
            </span>
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="line-clamp-2 w-full px-1 text-sm font-semibold leading-tight">
            {label}
          </span>
          {sub ? (
            <span
              className={cn(
                "text-[0.65rem] uppercase tracking-widest",
                tone === "civil" && "text-civil",
                tone === "undercover" && "text-undercover",
                tone === "mrwhite" && "text-mrwhite",
                !tone && "text-muted-foreground",
              )}
            >
              {sub}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

export function DealScreen({
  players,
  onPick,
  onStartRound,
}: {
  players: Player[];
  onPick: (cardIndex: number) => void;
  onStartRound: () => void;
}) {
  const remaining = players.filter((p) => p.order === -1).length;
  return (
    <Shell>
      <Eyebrow>Distribution</Eyebrow>
      <h1 className="mt-1 text-4xl">Choisis ta carte</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {remaining > 0
          ? `${remaining} carte${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} — passe le téléphone après chaque tirage.`
          : "Tout le monde connaît son mot. Le téléphone peut rester au centre."}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {players.map((p) => (
          <CardTile
            key={p.id}
            label={p.order === -1 ? String(p.cardIndex + 1) : p.name}
            sub={p.order === -1 ? undefined : `Joueur ${p.order + 1}`}
            state={p.order === -1 ? "hidden" : "taken"}
            onClick={p.order === -1 ? () => onPick(p.cardIndex) : undefined}
          />
        ))}
      </div>

      {remaining === 0 ? (
        <div className="mt-auto pt-8">
          <Button size="lg" className="w-full text-base font-semibold" onClick={onStartRound}>
            Commencer le tour de table
          </Button>
        </div>
      ) : null}
    </Shell>
  );
}

/* ------------------------------ Reveal flow ------------------------------ */

export function NameStep({
  defaultName,
  onValidate,
}: {
  defaultName: string;
  onValidate: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div>
          <Eyebrow>Carte tirée</Eyebrow>
          <h1 className="mt-1 text-4xl">Ton prénom&nbsp;?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Il servira à te reconnaître pendant les votes.
          </p>
        </div>
        <Input
          value={name}
          autoFocus
          maxLength={14}
          onChange={(e) => setName(e.target.value)}
          className="h-14 text-center font-display text-2xl"
        />
        <Button
          size="lg"
          className="w-full text-base font-semibold"
          onClick={() => onValidate(name.trim() || defaultName)}
        >
          Valider
        </Button>
      </div>
    </Shell>
  );
}

export function WordStep({ player, onValidate }: { player: Player; onValidate: () => void }) {
  const [shown, setShown] = useState(false);
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center gap-6 text-center">
        <div>
          <Eyebrow>{player.name}</Eyebrow>
          <h1 className="mt-1 text-4xl">Ton mot secret</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cache l&apos;écran des autres joueurs avant de révéler.
          </p>
        </div>

        <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 shadow-card">
          {!shown ? (
            <Button variant="secondary" size="lg" onClick={() => setShown(true)}>
              <Eye className="mr-2 h-5 w-5" /> Révéler
            </Button>
          ) : player.role === "mrwhite" ? (
            <>
              <p className="font-display text-4xl text-mrwhite">Mr White</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu n&apos;as pas de mot. Écoute, déduis et improvise.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-5xl text-primary">{player.word}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Décris-le sans jamais le prononcer.
              </p>
            </>
          )}
        </div>

        <Button
          size="lg"
          className="w-full text-base font-semibold"
          disabled={!shown}
          onClick={onValidate}
        >
          J&apos;ai compris, passer le téléphone
        </Button>
      </div>
    </Shell>
  );
}

/* -------------------------------- Round ---------------------------------- */

export function RoundScreen({
  order,
  round,
  onEndRound,
}: {
  order: Player[];
  round: number;
  onEndRound: () => void;
}) {
  return (
    <Shell>
      <Eyebrow>Manche {round}</Eyebrow>
      <h1 className="mt-1 text-4xl">Tour de table</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <strong className="text-primary">{order[0]?.name}</strong> commence, puis on continue dans
        l&apos;ordre. Un indice chacun, jamais le mot.
      </p>

      <ol className="mt-6 space-y-2">
        {order.map((p, i) => (
          <li
            key={p.id}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 font-display text-lg text-primary">
              {i + 1}
            </span>
            <span className="truncate font-semibold">{p.name}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto pt-8">
        <Button size="lg" className="w-full text-base font-semibold" onClick={onEndRound}>
          Finir le tour
        </Button>
      </div>
    </Shell>
  );
}

export function VoteScreen({
  players,
  onEliminate,
}: {
  players: Player[];
  onEliminate: (id: number) => void;
}) {
  return (
    <Shell>
      <Eyebrow>Vote</Eyebrow>
      <h1 className="mt-1 text-4xl">Qui est éliminé&nbsp;?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Votez à voix haute, puis touchez la carte du joueur éliminé.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={p.eliminated}
            onClick={() => onEliminate(p.id)}
            className={cn(
              "flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-2xl border border-border p-2 text-center transition-transform",
              p.eliminated ? "bg-muted/50 opacity-60" : "bg-card active:scale-95",
            )}
          >
            <span className="font-display text-xl text-primary">{p.order + 1}</span>
            <span className="line-clamp-2 px-1 text-sm font-semibold leading-tight">{p.name}</span>
            {p.eliminated ? (
              <span className="text-[0.65rem] uppercase tracking-widest text-destructive">
                {ROLE_LABEL[p.role]}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function EliminationScreen({
  player,
  onContinue,
}: {
  player: Player;
  onContinue: () => void;
}) {
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center gap-6 text-center">
        <Eyebrow>Éliminé</Eyebrow>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <p className="font-display text-3xl">{player.name}</p>
          <p
            className={cn(
              "mt-3 font-display text-5xl",
              player.role === "civil" && "text-civil",
              player.role === "undercover" && "text-undercover",
              player.role === "mrwhite" && "text-mrwhite",
            )}
          >
            {ROLE_LABEL[player.role]}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Son mot reste secret.</p>
        </div>
        <Button size="lg" className="w-full text-base font-semibold" onClick={onContinue}>
          Continuer
        </Button>
      </div>
    </Shell>
  );
}

export function MrWhiteGuessScreen({
  player,
  onGuess,
}: {
  player: Player;
  onGuess: (guess: string) => void;
}) {
  const [guess, setGuess] = useState("");
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div className="text-center">
          <Eyebrow>Dernière chance</Eyebrow>
          <h1 className="mt-1 text-4xl">{player.name} est Mr White</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Devine le mot des civils. Si tu trouves, tu gagnes la partie.
          </p>
        </div>
        <Input
          value={guess}
          autoFocus
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Le mot des civils…"
          className="h-14 text-center font-display text-2xl"
        />
        <Button
          size="lg"
          className="w-full text-base font-semibold"
          disabled={guess.trim().length === 0}
          onClick={() => onGuess(guess)}
        >
          Valider ma réponse
        </Button>
      </div>
    </Shell>
  );
}

export function EndScreen({
  outcome,
  players,
  pair,
  revealWord,
  mrWhiteWinner,
  onReplay,
}: {
  outcome: Outcome;
  players: Player[];
  pair: WordPair;
  revealWord: boolean;
  mrWhiteWinner: Player | null;
  onReplay: () => void;
}) {
  const title = mrWhiteWinner
    ? "Mr White a deviné !"
    : outcome === "civils"
      ? "Les civils gagnent !"
      : "Les undercover gagnent !";

  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-primary/20 blur-2xl" aria-hidden />
            <Trophy className="relative h-16 w-16 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="title-xl">{title}</h1>
          {mrWhiteWinner ? (
            <p className="text-sm text-muted-foreground">
              {mrWhiteWinner.name} a trouvé le mot des civils.
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 text-left shadow-card">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Les mots</p>
          <p className="mt-2 text-sm">
            Civils : <strong className="font-display text-xl text-civil">{pair.civil}</strong>
          </p>
          <p className="text-sm">
            Undercover :{" "}
            {revealWord ? (
              <strong className="font-display text-xl text-undercover">{pair.undercover}</strong>
            ) : (
              <strong className="font-display text-xl text-undercover">{pair.undercover}</strong>
            )}
          </p>
          <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            {players.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span className={cn("truncate", p.eliminated && "text-muted-foreground")}>
                  {p.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-xs uppercase tracking-widest",
                    p.role === "civil" && "text-civil",
                    p.role === "undercover" && "text-undercover",
                    p.role === "mrwhite" && "text-mrwhite",
                  )}
                >
                  {ROLE_LABEL[p.role]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Button size="lg" className="w-full text-base font-semibold" onClick={onReplay}>
          Rejouer
        </Button>
      </div>
    </Shell>
  );
}
