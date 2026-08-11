import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  DealScreen,
  EliminationScreen,
  EndScreen,
  HomeScreen,
  MrWhiteGuessScreen,
  NameStep,
  RoundScreen,
  SetupScreen,
  VoteScreen,
  WordStep,
} from "@/components/undercover/screens";
import {
  checkOutcome,
  createGame,
  normalizeWord,
  pickStarter,
  speakingOrder,
  type Game,
  type Outcome,
  type Player,
} from "@/lib/undercover";

const TITLE = "Undercover — jeu de bluff sur un seul téléphone";
const DESCRIPTION =
  "Jouez à Undercover de 3 à 10 joueurs avec un seul téléphone, hors ligne : mots secrets, indices, votes, Mr White et écran de victoire.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

type Phase =
  "home" | "setup" | "deal" | "name" | "word" | "round" | "vote" | "elim" | "mrwhite" | "end";

function Index() {
  const [phase, setPhase] = useState<Phase>("home");
  const [game, setGame] = useState<Game | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [lastEliminated, setLastEliminated] = useState<Player | null>(null);
  const [pendingMrWhite, setPendingMrWhite] = useState<Player | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [mrWhiteWinner, setMrWhiteWinner] = useState<Player | null>(null);

  const active = game && activeId !== null ? game.players.find((p) => p.id === activeId) : null;

  const reset = () => {
    setGame(null);
    setActiveId(null);
    setRound(1);
    setLastEliminated(null);
    setPendingMrWhite(null);
    setOutcome(null);
    setMrWhiteWinner(null);
  };

  const startGame = (players: number, undercover: number, mrWhite: number) => {
    setGame(createGame(players, undercover, mrWhite));
    setRound(1);
    setPhase("deal");
  };

  const pickCard = (cardIndex: number) => {
    if (!game) return;
    const player = game.players.find((p) => p.cardIndex === cardIndex);
    if (!player) return;
    setActiveId(player.id);
    setPhase("name");
  };

  const validateName = (name: string) => {
    if (!game || activeId === null) return;
    const takenCount = game.players.filter((p) => p.order !== -1).length;
    setGame({
      ...game,
      players: game.players.map((p) => (p.id === activeId ? { ...p, name, order: takenCount } : p)),
    });
    setPhase("word");
  };

  const validateWord = () => {
    setActiveId(null);
    setPhase("deal");
  };

  const startRoundTable = () => {
    if (!game) return;
    setGame({ ...game, roundStarterOrder: pickStarter(game.players) });
    setPhase("round");
  };

  const eliminate = (id: number) => {
    if (!game) return;
    const player = game.players.find((p) => p.id === id);
    if (!player) return;
    if (player.role === "mrwhite") {
      setPendingMrWhite(player);
      setPhase("mrwhite");
      return;
    }
    applyElimination(player);
  };

  const applyElimination = (player: Player) => {
    if (!game) return;
    const players = game.players.map((p) => (p.id === player.id ? { ...p, eliminated: true } : p));
    setGame({ ...game, players });
    setLastEliminated({ ...player, eliminated: true });
    setOutcome(checkOutcome(players));
    setPhase("elim");
  };

  const mrWhiteGuess = (guess: string) => {
    if (!game || !pendingMrWhite) return;
    const correct = normalizeWord(guess) === normalizeWord(game.pair.civil);
    if (correct) {
      setMrWhiteWinner(pendingMrWhite);
      setOutcome("impostors");
      setPendingMrWhite(null);
      setPhase("end");
      return;
    }
    const player = pendingMrWhite;
    setPendingMrWhite(null);
    applyElimination(player);
  };

  const continueAfterElimination = () => {
    if (!game) return;
    if (outcome) {
      setPhase("end");
      return;
    }
    setRound((r) => r + 1);
    setGame({ ...game, roundStarterOrder: pickStarter(game.players) });
    setPhase("round");
  };

  if (phase === "setup") {
    return <SetupScreen onPlay={startGame} onBack={() => setPhase("home")} />;
  }

  if (phase === "home" || !game) {
    return <HomeScreen onStart={() => setPhase("setup")} />;
  }

  if (phase === "name" && active) {
    return (
      <NameStep
        key={active.id}
        defaultName={`Joueur ${game.players.filter((p) => p.order !== -1).length + 1}`}
        onValidate={validateName}
      />
    );
  }

  if (phase === "word" && active) {
    return <WordStep key={active.id} player={active} onValidate={validateWord} />;
  }

  if (phase === "round") {
    return (
      <RoundScreen
        order={speakingOrder(game.players, game.roundStarterOrder)}
        round={round}
        onEndRound={() => setPhase("vote")}
      />
    );
  }

  if (phase === "vote") {
    return (
      <VoteScreen
        players={[...game.players].sort((a, b) => a.order - b.order)}
        onEliminate={eliminate}
      />
    );
  }

  if (phase === "mrwhite" && pendingMrWhite) {
    return <MrWhiteGuessScreen player={pendingMrWhite} onGuess={mrWhiteGuess} />;
  }

  if (phase === "elim" && lastEliminated) {
    return <EliminationScreen player={lastEliminated} onContinue={continueAfterElimination} />;
  }

  if (phase === "end") {
    return (
      <EndScreen
        outcome={outcome}
        players={[...game.players].sort((a, b) => a.order - b.order)}
        pair={game.pair}
        mrWhiteWinner={mrWhiteWinner}
        onReplay={() => {
          reset();
          setPhase("setup");
        }}
      />
    );
  }

  return <DealScreen players={game.players} onPick={pickCard} onStartRound={startRoundTable} />;
}
