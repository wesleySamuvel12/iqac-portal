/**
 * Achievement Service Helper Utilities
 * Handles title normalization, category matching, serial number calculation, and duplicate detection
 * strictly for Journal Publication, Conference Publication, and Patent categories.
 */

export const SPECIAL_ACHIEVEMENT_CATEGORIES = {
  JOURNAL_PUBLICATION: 'Journal Publication',
  CONFERENCE_PUBLICATION: 'Conference Publication',
  PATENT: 'Patent',
} as const

export type SpecialCategoryLabel = typeof SPECIAL_ACHIEVEMENT_CATEGORIES[keyof typeof SPECIAL_ACHIEVEMENT_CATEGORIES]

/**
 * Normalizes title string for exact duplicate checking:
 * - Trims leading and trailing whitespace
 * - Converts to lower case
 * - Replaces multiple whitespace characters with a single space
 */
export function normalizeTitle(title: string): string {
  if (!title) return ''
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * Checks if a given category key or label matches one of the three special categories
 */
export function isSpecialCategory(categoryKeyOrLabel: string): boolean {
  if (!categoryKeyOrLabel) return false
  const key = categoryKeyOrLabel.trim().toUpperCase()
  
  return (
    key === 'JOURNAL' ||
    key === 'JOURNAL_PUBLICATION' ||
    key === 'JOURNAL PAPER' ||
    key === 'JOURNAL_DETAILED' ||
    key === 'CONFERENCE' ||
    key === 'CONFERENCE_PUBLICATION' ||
    key === 'PUBLICATION' ||
    key === 'PATENT' ||
    categoryKeyOrLabel === SPECIAL_ACHIEVEMENT_CATEGORIES.JOURNAL_PUBLICATION ||
    categoryKeyOrLabel === SPECIAL_ACHIEVEMENT_CATEGORIES.CONFERENCE_PUBLICATION ||
    categoryKeyOrLabel === SPECIAL_ACHIEVEMENT_CATEGORIES.PATENT
  )
}

/**
 * Maps any category identifier to its canonical label: 'Journal Publication', 'Conference Publication', or 'Patent'
 */
export function getCanonicalCategoryLabel(categoryKeyOrLabel: string): SpecialCategoryLabel | string {
  if (!categoryKeyOrLabel) return ''
  const key = categoryKeyOrLabel.trim().toUpperCase()

  if (
    key === 'JOURNAL' ||
    key === 'JOURNAL_PUBLICATION' ||
    key === 'JOURNAL PAPER' ||
    key === 'JOURNAL_DETAILED' ||
    categoryKeyOrLabel === SPECIAL_ACHIEVEMENT_CATEGORIES.JOURNAL_PUBLICATION
  ) {
    return SPECIAL_ACHIEVEMENT_CATEGORIES.JOURNAL_PUBLICATION
  }

  if (
    key === 'CONFERENCE' ||
    key === 'CONFERENCE_PUBLICATION' ||
    key === 'PUBLICATION' ||
    categoryKeyOrLabel === SPECIAL_ACHIEVEMENT_CATEGORIES.CONFERENCE_PUBLICATION
  ) {
    return SPECIAL_ACHIEVEMENT_CATEGORIES.CONFERENCE_PUBLICATION
  }

  if (
    key === 'PATENT' ||
    categoryKeyOrLabel === SPECIAL_ACHIEVEMENT_CATEGORIES.PATENT
  ) {
    return SPECIAL_ACHIEVEMENT_CATEGORIES.PATENT
  }

  return categoryKeyOrLabel
}

export interface SerialNumberMap {
  titleToSerial: Record<string, string> // normalizedTitle -> "01", "02", etc.
  recordSerials: Record<string, string> // recordId/title -> "01", "02", etc.
  distinctCount: number
}

/**
 * Computes category-specific serial numbers for a list of records in chronological order.
 * - Same normalized title gets the SAME serial number.
 * - Subsequent distinct titles receive the next sequential serial number.
 * - Independent per category.
 */
export function computeCategorySerialNumbers<T extends { id?: string | number; title: string; createdAt?: Date | string }>(
  records: T[]
): SerialNumberMap {
  const titleToSerial: Record<string, string> = {}
  const recordSerials: Record<string, string> = {}
  let counter = 1

  // Process records in order
  records.forEach((rec, idx) => {
    const norm = normalizeTitle(rec.title)
    if (!norm) return

    let serialStr: string
    if (titleToSerial[norm]) {
      serialStr = titleToSerial[norm]
    } else {
      serialStr = String(counter).padStart(2, '0')
      titleToSerial[norm] = serialStr
      counter++
    }

    const key = rec.id ? String(rec.id) : `idx_${idx}`
    recordSerials[key] = serialStr
  })

  return {
    titleToSerial,
    recordSerials,
    distinctCount: counter - 1,
  }
}

/**
 * Checks if a new title matches an existing record under a category
 * Returns matching serial number if found, or null if not found.
 */
export function findMatchingDuplicateSerial<T extends { title: string }>(
  existingRecords: T[],
  newTitle: string
): { isDuplicate: boolean; serialNo: string } {
  const normNew = normalizeTitle(newTitle)
  if (!normNew) return { isDuplicate: false, serialNo: '01' }

  const { titleToSerial, distinctCount } = computeCategorySerialNumbers(existingRecords)

  if (titleToSerial[normNew]) {
    return {
      isDuplicate: true,
      serialNo: titleToSerial[normNew],
    }
  }

  // If not a duplicate, next serial number would be next counter
  const nextSerial = String(distinctCount + 1).padStart(2, '0')
  return {
    isDuplicate: false,
    serialNo: nextSerial,
  }
}
