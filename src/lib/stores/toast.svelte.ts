export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

function createToastStore() {
  let toasts = $state<Toast[]>([]);

  return {
    get toasts() { return toasts; },

    add(message: string, type: Toast['type'] = 'info', duration = 3000): void {
      const id = crypto.randomUUID();
      toasts.push({ id, message, type, duration });
      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
      }, duration);
    },

    success(message: string): void { this.add(message, 'success'); },
    error(message: string): void { this.add(message, 'error', 5000); },
    info(message: string): void { this.add(message, 'info'); },

    dismiss(id: string): void {
      toasts = toasts.filter((t) => t.id !== id);
    },
  };
}

export const toastStore = createToastStore();
