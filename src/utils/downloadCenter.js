const STORAGE_KEY = "download_center_history";
const EXPIRE_DAYS = 7;

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    const now = Date.now();
    const expireMs = EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    const filtered = list.filter((item) => now - item.createTime < expireMs);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    return [];
  }
}

function addRecord(record) {
  const list = getHistory();
  const newRecord = Object.assign(
    {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      createTime: Date.now(),
      status: "success",
    },
    record
  );
  list.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newRecord;
}

function removeRecord(id) {
  const list = getHistory();
  const filtered = list.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

function clearHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getExpireTime(timestamp) {
  const expireMs = EXPIRE_DAYS * 24 * 60 * 60 * 1000;
  const expireTime = timestamp + expireMs;
  const remainMs = expireTime - Date.now();
  if (remainMs <= 0) return "已过期";
  const days = Math.floor(remainMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (remainMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  if (days > 0) return `${days}天${hours}小时后过期`;
  return `${hours}小时后过期`;
}

function getFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default {
  getHistory,
  addRecord,
  removeRecord,
  clearHistory,
  formatTime,
  getExpireTime,
  getFileSize,
  EXPIRE_DAYS,
};
