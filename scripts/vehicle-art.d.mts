// Typen für den Fahrzeug-Generator, damit die App ihn beim Build direkt nutzen kann.
export interface Body {
  L: number;
  clr: number;
  wr: number;
  w: number[];
  top: number;
  [key: string]: unknown;
}
export interface CarOptions {
  id?: string;
  color?: string;
  glass?: string;
  rim?: string;
  roof?: string;
  roofDown?: boolean;
  accent?: string;
  simple?: boolean;
  /** CSS-Klasse für die Speichen, damit sich die Räder drehen lassen */
  spin?: string;
}
export const BODIES: Record<string, Body>;
export function car(type: string, o?: CarOptions): { svg: string; L: number; top: number };
export function cutout(type: string, o?: CarOptions): string;
export function mix(a: string, b: string, t: number): string;
