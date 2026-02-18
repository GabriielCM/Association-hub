/**
 * Format a message timestamp to "HH:MM" in pt-BR
 */
export function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format conversation list timestamp:
 * - Today: "HH:MM"
 * - Yesterday: "Ontem"
 * - Older: "DD/MM"
 */
export function formatConversationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date >= today) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(today.getTime() - 86400000);
  if (date >= yesterday) return 'Ontem';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Format date for separator chips between messages:
 * - Today: "Hoje"
 * - Yesterday: "Ontem"
 * - This year: "12 de Fev"
 * - Other years: "12 de Fev de 2024"
 */
export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date >= today) return 'Hoje';

  const yesterday = new Date(today.getTime() - 86400000);
  if (date >= yesterday) return 'Ontem';

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];

  if (date.getFullYear() === now.getFullYear()) {
    return `${day} de ${month}`;
  }

  return `${day} de ${month} de ${date.getFullYear()}`;
}

/**
 * Check if two date strings are on the same calendar day
 */
export function isSameDay(d1: string, d2: string): boolean {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
