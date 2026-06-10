import type { DicePack } from "./caroline-store";

export const PRESET_PACKS: DicePack[] = [
  {
    id: "preset_drinking",
    name: "Friends Drinking 🍻",
    color: "var(--coral)",
    createdAt: 0,
    sides: [
      { text: "Shot!", emoji: "🍺" },
      { text: "Toast King", emoji: "👑" },
      { text: "Swap Drinks", emoji: "🍹" },
      { text: "Truth", emoji: "❓" },
      { text: "Dare", emoji: "🔥" },
      { text: "Punishment Round", emoji: "🍻" },
    ],
  },
  {
    id: "preset_family",
    name: "Family Gathering 👨‍👩‍👧‍👦",
    color: "var(--butter)",
    createdAt: 0,
    sides: [
      { text: "Tell a Joke", emoji: "😂" },
      { text: "Talent Show", emoji: "🎤" },
      { text: "Compliments", emoji: "❤️" },
      { text: "Throwback", emoji: "📸" },
      { text: "House Chore", emoji: "🏠" },
      { text: "Hug Time", emoji: "🤗" },
    ],
  },
  {
    id: "preset_team",
    name: "Team Building 🏢",
    color: "var(--powder)",
    createdAt: 0,
    sides: [
      { text: "Team Pose", emoji: "💪" },
      { text: "Hidden Talent", emoji: "🎭" },
      { text: "Roast Time", emoji: "😆" },
      { text: "Praise Storm", emoji: "🌟" },
      { text: "Mini Game", emoji: "🎲" },
      { text: "Future Wish", emoji: "🚀" },
    ],
  },
  {
    id: "preset_couple",
    name: "Couple Daily 💕",
    color: "var(--pink)",
    createdAt: 0,
    sides: [
      { text: "Kiss Attack", emoji: "💋" },
      { text: "Hype Me Up", emoji: "❤️" },
      { text: "Mini Task", emoji: "🎁" },
      { text: "Truth Time", emoji: "🥰" },
      { text: "Memory Mode", emoji: "📖" },
      { text: "Sweet Penalty", emoji: "🍬" },
    ],
  },
  {
    id: "preset_party",
    name: "Party Madness 🎉",
    color: "var(--lavender)",
    createdAt: 0,
    sides: [
      { text: "Dance Floor", emoji: "💃" },
      { text: "Penalty Chain", emoji: "🔥" },
      { text: "Talent Bomb", emoji: "🎤" },
      { text: "King's Order", emoji: "👑" },
      { text: "Selfie Quest", emoji: "📸" },
      { text: "Cheers All", emoji: "🍾" },
    ],
  },
  {
    id: "preset_travel",
    name: "Travel Adventure 🌍",
    color: "var(--sage)",
    createdAt: 0,
    sides: [
      { text: "Photo Mission", emoji: "📷" },
      { text: "Local Food", emoji: "🍜" },
      { text: "Tiny Adventure", emoji: "🗺️" },
      { text: "Trip Story", emoji: "🛫" },
      { text: "Surprise Gift", emoji: "🎁" },
      { text: "Chill Mode", emoji: "🏖️" },
    ],
  },
  {
    id: "preset_hearts_pip",
    name: "Bluelover",
    color: "var(--snow)",
    createdAt: 0,
    sides: [
      { text: "", emoji: "💙", mode: "pip" },
      { text: "", emoji: "💙", mode: "pip" },
      { text: "", emoji: "💙", mode: "pip" },
      { text: "", emoji: "💙", mode: "pip" },
      { text: "", emoji: "💙", mode: "pip" },
      { text: "", emoji: "💙", mode: "pip" },
    ],
  },
];

export function findPack(id: string, userPacks: DicePack[]): DicePack | undefined {
  return PRESET_PACKS.find((p) => p.id === id) ?? userPacks.find((p) => p.id === id);
}
