// The one tone palette. The three substrate tones each map to a color. Peace is
// the dark ground, pleasure is blue, pain is red. The array order matches the
// packed tone index the renderers use (0 peace, 1 pleasure, 2 pain), so a
// renderer can index TONE_COLORS directly by the current value.

export const PEACE: [number, number, number] = [10, 10, 11]
export const PLEASURE: [number, number, number] = [59, 130, 246]
export const PAIN: [number, number, number] = [248, 90, 114]

export const TONE_COLORS: [number, number, number][] = [PEACE, PLEASURE, PAIN]
