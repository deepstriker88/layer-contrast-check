export interface ContrastPair { name: string; text: string; surface: string; minimum?: number }
export interface ContrastResult { name: string; ratio: number; minimum: number; pass: boolean }
export function checkContrastPairs(input: {canvas: string; pairs: readonly ContrastPair[]}): ContrastResult[];
