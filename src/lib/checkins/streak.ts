// dates: ISO "YYYY-MM-DD" strings, sorted descending, one per day (unique).
export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const oneDay = 24 * 60 * 60 * 1000;
  const todayStr = new Date().toISOString().slice(0, 10);

  let expected = new Date(todayStr);
  // If today hasn't been checked in yet, the streak still counts through
  // yesterday rather than resetting to 0.
  if (dates[0] !== todayStr) {
    expected = new Date(expected.getTime() - oneDay);
  }

  let streak = 0;
  for (const date of dates) {
    const expectedStr = expected.toISOString().slice(0, 10);
    if (date === expectedStr) {
      streak++;
      expected = new Date(expected.getTime() - oneDay);
    } else if (date < expectedStr) {
      break;
    }
  }

  return streak;
}
