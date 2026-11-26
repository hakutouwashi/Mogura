export class RiddlePicker {
  constructor(riddles, targetGroup, correctRatioPercent, random = Math.random) {
    this.groups = {
      correct: riddles[targetGroup] || [],
      incorrect: Object.entries(riddles)
        .filter(([group]) => group !== targetGroup)
        .flatMap(([, images]) => images)
    };
    this.ratio = correctRatioPercent / 100;
    this.random = random;
    this.bags = { correct: [], incorrect: [] };
    this.lastId = null;
  }
  refill(group) {
    const bag = [...this.groups[group]];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    this.bags[group] = bag;
  }
  pick(activeIds = [], correctRatio = this.ratio) {
    let group = this.random() < correctRatio ? 'correct' : 'incorrect';
    if (!this.groups[group].length) group = group === 'correct' ? 'incorrect' : 'correct';
    if (!this.groups[group].length) return null;
    if (!this.bags[group].length) this.refill(group);
    let bag = this.bags[group];
    let index = bag.findIndex(item => item.id !== this.lastId && !activeIds.includes(item.id));
    if (index < 0) index = bag.findIndex(item => item.id !== this.lastId);
    if (index < 0) index = 0;
    const [item] = bag.splice(index, 1);
    this.lastId = item.id;
    return { ...item, isCorrect: group === 'correct' };
  }
}
