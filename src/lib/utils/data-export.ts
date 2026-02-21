const STORAGE_KEYS = [
  'cortex:notes',
  'cortex:tasks',
  'cortex:goals',
  'cortex:note-categories',
  'cortex:claude-messages',
  'cortex:sidebar-collapsed',
] as const;

interface ExportData {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportData(): void {
  const data: Record<string, unknown> = {};
  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }

  const exportObj: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cortex-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as ExportData;

    if (!parsed.version || !parsed.data || typeof parsed.data !== 'object') {
      return { success: false, error: 'Invalid backup file format.' };
    }

    for (const [key, value] of Object.entries(parsed.data)) {
      if (STORAGE_KEYS.includes(key as typeof STORAGE_KEYS[number])) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to parse backup file.' };
  }
}
