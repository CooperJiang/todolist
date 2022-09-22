export function setStorageItem( key, value) {
  return localStorage.setItem(key, JSON.stringify(value) )
}

export function getStorageItem(key) {
  return JSON.parse(localStorage.getItem(key))
}

