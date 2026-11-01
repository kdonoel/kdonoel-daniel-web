// The preposition "de" is elided before a vowel or a mute h
const ELISION_REGEXP: RegExp = /^[aeiouhàâäéèêëîïôöùûü]/i;

export type PluralKey = 'zero' | 'one' | 'other';

/**
 * "de Benjamin" but "d'Alice"
 */
export function withPrepositionDe(name: string): string {
	return ELISION_REGEXP.test(name ?? '') ? `d'${name}` : `de ${name}`;
}

/**
 * "1er novembre", "12 novembre", never split on two lines
 */
export function formatDayAndMonth(date: Date | string): string {
	const value = new Date(date);
	const day = value.getDate();
	return `${day === 1 ? '1er' : day}\u00a0${value.toLocaleDateString('fr-FR', { month: 'long' })}`;
}

/**
 * Key of the plural form of a count: the texts display "Aucune idée", "1 idée" and "2 idées"
 */
export function getPluralKey(count: number): PluralKey {
	if (!count) return 'zero';
	return count === 1 ? 'one' : 'other';
}
