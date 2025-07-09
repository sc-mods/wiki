let currentMod = '';
let currentCategory = 'melee';

export function setMod(modId) {
  currentMod = modId;
}

export function setCategory(category) {
  currentCategory = category;
}

export function getUrl({ faction = '', unit = '', upgrade = '' } = {}) {
  const params = new URLSearchParams();

  // Always include mod
  if (!currentMod) throw new Error('Mod is not set');
  params.set('mod', currentMod);

  // Add category only if not default
  if (currentCategory && currentCategory !== 'melee') {
    params.set('category', currentCategory);
  }

  // Add one of unit/upgrade/faction if defined (unit and upgrade take priority)
  if (unit) {
    params.set('unit', unit);
  } else if (upgrade) {
    params.set('upgrade', upgrade);
  } else if (faction) {
    params.set('faction', faction);
  }

  return `?${params.toString()}`;
}
