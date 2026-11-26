export const MODES = [
  { group: 'mole', label: 'もぐら' },
  { group: 'fish', label: 'さかな' },
  { group: 'fruit', label: 'くだもの' }
];

export const RIDDLE_GROUPS = [...MODES.map(mode => mode.group), 'other'];
