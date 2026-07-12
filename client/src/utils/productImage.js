const imageModules = import.meta.glob('/src/assets/products/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const FALLBACK_PLACEHOLDER = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3e%3crect width='200' height='200' fill='%23f1f5f9'/%3e%3ccircle cx='100' cy='80' r='30' fill='%23cbd5e1'/%3e%3crect x='60' y='120' width='80' height='50' rx='8' fill='%23cbd5e1'/%3e%3c/svg%3e";

const filenameMap = {};
const availableImages = [];

for (const [filePath, url] of Object.entries(imageModules)) {
  const filename = filePath.split('/').pop();
  if (!filename || filename === 'placeholder.svg') continue;
  filenameMap[filename.toLowerCase()] = url;
  availableImages.push({ filename, url });
}

const placeholderUrl = imageModules['/src/assets/products/placeholder.svg'] || FALLBACK_PLACEHOLDER;
filenameMap['placeholder.svg'] = placeholderUrl;

availableImages.sort((a, b) => a.filename.localeCompare(b.filename));

export function getProductImageUrl(filename) {
  if (!filename || typeof filename !== 'string') return placeholderUrl;
  return filenameMap[filename.toLowerCase().trim()] || placeholderUrl;
}

export function getAvailableProductImages() {
  return availableImages;
}

export function getPlaceholderUrl() {
  return placeholderUrl;
}

export function isLocalProductFilename(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !trimmed.includes('/') && !trimmed.includes('\\') &&
    !trimmed.startsWith('http://') && !trimmed.startsWith('https://') &&
    !trimmed.startsWith('data:') && !trimmed.startsWith('blob:');
}
