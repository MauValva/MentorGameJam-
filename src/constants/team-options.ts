export const gameStates = ["Conceito", "Protótipo", "Jogável", "Polimento", "Finalizado"] as const;

export const visualStyles = ["Pixel Art", "Cartoon", "Low Poly", "Hand-painted", "Minimalista", "Vetorial", "Realista", "Semi-realista", "Anime / Manga", "Voxel", "Retro / PS1", "Estilizado", "Outro"] as const;

export type GameState = (typeof gameStates)[number];
export type VisualStyle = (typeof visualStyles)[number];
