const STORAGE_KEYS = {
  team: 'dbs-team-logos',
  project: 'dbs-project-logos',
};

function getStorageKey(type) {
  return STORAGE_KEYS[type];
}

function readLogoMap(type) {
  const key = getStorageKey(type);
  if (!key) return {};

  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function writeLogoMap(type, nextMap) {
  const key = getStorageKey(type);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(nextMap));
}

export function getStoredLogo(type, id) {
  if (!id) return '';
  const map = readLogoMap(type);
  return map[String(id)] || '';
}

export function saveStoredLogo(type, id, dataUrl) {
  if (!id) return;
  const map = readLogoMap(type);
  map[String(id)] = dataUrl;
  writeLogoMap(type, map);
}

export function removeStoredLogo(type, id) {
  if (!id) return;
  const map = readLogoMap(type);
  delete map[String(id)];
  writeLogoMap(type, map);
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}
