export const defaultSettings = Object.freeze({
  gameDurationSec: 60,
  scoreHitMole: 100,
  scoreHitOther: 50,
  riddleLifetimeSec: 5,
  maxActive: 3,
  spawnIntervalStartSec: 2,
  spawnIntervalMinSec: 0.7,
  moleRatioPercent: 60,
  allowNegativeScore: false,
  keyLayout: 'keyboard',
  resultAutoReturnSec: 0,
  resultCountUpSec: 1.5
});

const ranges = {
  gameDurationSec: [10, 600], scoreHitMole: [0, 10000],
  scoreHitOther: [0, 10000], riddleLifetimeSec: [0.5, 30],
  maxActive: [1, 9], spawnIntervalStartSec: [0.1, 10],
  spawnIntervalMinSec: [0.1, 10], moleRatioPercent: [0, 100],
  resultAutoReturnSec: [0, 60], resultCountUpSec: [0, 5]
};

export function normalizeSettings(input = {}) {
  const result = { ...defaultSettings };
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const value = Number(input[key]);
    if (input[key] === '' || input[key] == null || !Number.isFinite(value)) continue;
    result[key] = Math.max(min, Math.min(max, value));
  }
  result.maxActive = Math.round(result.maxActive);
  result.moleRatioPercent = Math.round(result.moleRatioPercent);
  result.scoreHitMole = Math.round(result.scoreHitMole);
  result.scoreHitOther = Math.round(result.scoreHitOther);
  result.allowNegativeScore = typeof input.allowNegativeScore === 'boolean'
    ? input.allowNegativeScore : defaultSettings.allowNegativeScore;
  result.keyLayout = ['keyboard', 'phone'].includes(input.keyLayout)
    ? input.keyLayout : defaultSettings.keyLayout;
  if (result.spawnIntervalMinSec > result.spawnIntervalStartSec) {
    [result.spawnIntervalMinSec, result.spawnIntervalStartSec] =
      [result.spawnIntervalStartSec, result.spawnIntervalMinSec];
  }
  return result;
}
