export function isDuplicateHomeBiographyText(value: string): boolean {
  const text = value.toLowerCase()
  if (!text) return false

  const hasErinIdentity =
    text.includes('erin jerri') ||
    text.includes('erin pangilinan') ||
    /\bhi,\s+i['’]m\s+erin\b/.test(text)
  const hasBioSignals = [
    'software engineer',
    'startup founder',
    'former cto',
    "o'reilly",
    'o’ reilly',
    'o’reilly',
    'creating augmented and virtual realities',
    'timebite',
    'spatial computing',
  ].filter((signal) => text.includes(signal)).length

  return hasErinIdentity && hasBioSignals >= 2
}
