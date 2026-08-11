export type Role = "civil" | "undercover" | "mrwhite";

export type Player = {
  id: number;
  cardIndex: number; // position of the card on the board
  order: number; // order in which the card was picked
  name: string;
  role: Role;
  word: string | null;
  eliminated: boolean;
};

export type WordPair = { civil: string; undercover: string };

export const WORD_PAIRS: WordPair[] = [
  { civil: "Citron", undercover: "Orange" },
  { civil: "Café", undercover: "Thé" },
  { civil: "Chien", undercover: "Loup" },
  { civil: "Plage", undercover: "Désert" },
  { civil: "Guitare", undercover: "Violon" },
  { civil: "Pizza", undercover: "Quiche" },
  { civil: "Avion", undercover: "Hélicoptère" },
  { civil: "Docteur", undercover: "Infirmier" },
  { civil: "Neige", undercover: "Pluie" },
  { civil: "Bicyclette", undercover: "Trottinette" },
  { civil: "Cinéma", undercover: "Théâtre" },
  { civil: "Roi", undercover: "Président" },
  { civil: "Miroir", undercover: "Fenêtre" },
  { civil: "Chocolat", undercover: "Caramel" },
  { civil: "Piscine", undercover: "Baignoire" },
  { civil: "Montagne", undercover: "Colline" },
  { civil: "Bibliothèque", undercover: "Librairie" },
  { civil: "Footballeur", undercover: "Rugbyman" },
  { civil: "Mariage", undercover: "Anniversaire" },
  { civil: "Pompier", undercover: "Policier" },
  { civil: "Château", undercover: "Cathédrale" },
  { civil: "Bière", undercover: "Vin" },
  { civil: "Train", undercover: "Métro" },
  { civil: "Sorcière", undercover: "Magicien" },
  { civil: "Poivre", undercover: "Sel" },
  { civil: "Lune", undercover: "Soleil" },
  { civil: "Boulanger", undercover: "Pâtissier" },
  { civil: "Vacances", undercover: "Week-end" },
  { civil: "Téléphone", undercover: "Ordinateur" },
  { civil: "Fourchette", undercover: "Cuillère" },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export function maxUndercover(players: number) {
  return Math.min(3, Math.max(1, players - 1));
}

export function maxMrWhite(players: number, undercover: number) {
  // civils must be strictly more than half of the players
  const minCivils = Math.floor(players / 2) + 1;
  return Math.max(0, Math.min(2, players - minCivils - undercover));
}

export function isValidSetup(players: number, undercover: number, mrWhite: number) {
  const civils = players - undercover - mrWhite;
  return players >= 3 && players <= 10 && undercover >= 1 && mrWhite >= 0 && civils > players / 2;
}

export type Game = {
  pair: WordPair;
  players: Player[];
  roundStarterOrder: number; // order index of the first speaker
};

export function createGame(playerCount: number, undercover: number, mrWhite: number): Game {
  const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)] as WordPair;
  const roles: Role[] = [
    ...Array.from({ length: undercover }, () => "undercover" as Role),
    ...Array.from({ length: mrWhite }, () => "mrwhite" as Role),
    ...Array.from({ length: playerCount - undercover - mrWhite }, () => "civil" as Role),
  ];
  const shuffled = shuffle(roles);
  const players: Player[] = shuffled.map((role, i) => ({
    id: i,
    cardIndex: i,
    order: -1,
    name: "",
    role,
    word: role === "civil" ? pair.civil : role === "undercover" ? pair.undercover : null,
    eliminated: false,
  }));
  return { pair, players, roundStarterOrder: 0 };
}

export function pickStarter(players: Player[]): number {
  const ordered = players.filter((p) => !p.eliminated).sort((a, b) => a.order - b.order);
  const eligible = ordered.filter((p) => p.role !== "mrwhite");
  const chosen =
    eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : ordered[0];
  return chosen ? chosen.order : 0;
}

export function speakingOrder(players: Player[], starterOrder: number): Player[] {
  const alive = players.filter((p) => !p.eliminated).sort((a, b) => a.order - b.order);
  const start = alive.findIndex((p) => p.order === starterOrder);
  if (start <= 0) return alive;
  return [...alive.slice(start), ...alive.slice(0, start)];
}

export type Outcome = "civils" | "impostors" | null;

export function checkOutcome(players: Player[]): Outcome {
  const alive = players.filter((p) => !p.eliminated);
  const impostors = alive.filter((p) => p.role !== "civil").length;
  const civils = alive.filter((p) => p.role === "civil").length;
  if (impostors === 0) return "civils";
  if (civils <= 1) return "impostors";
  return null;
}

export function normalizeWord(w: string) {
  return w
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export const ROLE_LABEL: Record<Role, string> = {
  civil: "Civil",
  undercover: "Undercover",
  mrwhite: "Mr White",
};
