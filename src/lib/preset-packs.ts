import type { DicePack } from "./caroline-store";

export const PRESET_PACKS: DicePack[] = [
  {
    id: "preset_dinner",
    name: "What's for Dinner Tonight?",
    color: "var(--butter)",
    createdAt: 0,
    sides: [
      { text: "Pizza", emoji: "🍕" },
      { text: "Sushi", emoji: "🍣" },
      { text: "Burger", emoji: "🍔" },
      { text: "Tacos", emoji: "🌮" },
      { text: "Pasta", emoji: "🍝" },
      { text: "Salad", emoji: "🥗" },
    ],
  },
  {
    id: "preset_drinking",
    name: "Drinking Lineup",
    color: "var(--coral)",
    createdAt: 0,
    sides: [
      { text: "Take a shot", emoji: "🥃" },
      { text: "Pass the drink", emoji: "🍻" },
      { text: "Pick someone", emoji: "👉" },
      { text: "Cheers all", emoji: "🥂" },
      { text: "Double down", emoji: "⚡" },
      { text: "Truth or drink", emoji: "🤐" },
    ],
  },
  {
    id: "preset_whosnext",
    name: "Who's Next?",
    color: "var(--pink)",
    createdAt: 0,
    sides: [
      { text: "Lukas", emoji: "🧑" },
      { text: "Emma", emoji: "👩" },
      { text: "Sofia", emoji: "💁" },
      { text: "Noah", emoji: "🧔" },
      { text: "Mia", emoji: "👧" },
      { text: "Leo", emoji: "🦁" },
    ],
  },
  {
    id: "preset_truthdare",
    name: "Truth or Dare",
    color: "var(--lavender)",
    createdAt: 0,
    sides: [
      { text: "Truth", emoji: "💭" },
      { text: "Dare", emoji: "🔥" },
      { text: "Skip", emoji: "⏭️" },
      { text: "Drink", emoji: "🍷" },
      { text: "Switch", emoji: "🔄" },
      { text: "Wildcard", emoji: "🎴" },
    ],
  },
  {
    id: "preset_roadtrip",
    name: "Road Trip Vibes",
    color: "var(--sage)",
    createdAt: 0,
    sides: [
      { text: "Snack stop", emoji: "🍿" },
      { text: "New playlist", emoji: "🎧" },
      { text: "Photo time", emoji: "📸" },
      { text: "Window down", emoji: "🌬️" },
      { text: "Tell a story", emoji: "🗣️" },
      { text: "Trade seats", emoji: "💺" },
    ],
  },
];

export function findPack(id: string, userPacks: DicePack[]): DicePack | undefined {
  return PRESET_PACKS.find((p) => p.id === id) ?? userPacks.find((p) => p.id === id);
}
