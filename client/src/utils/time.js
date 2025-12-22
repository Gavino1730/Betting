export const formatTime = (timeValue) => {
  if (!timeValue) return '';

  // If it's a Date or ISO string, try Date parsing first
  if (typeof timeValue === 'string' && timeValue.includes('T')) {
    const parsed = new Date(timeValue);
    if (!isNaN(parsed)) {
      return parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  }

  // If we already have a Date
  if (timeValue instanceof Date && !isNaN(timeValue)) {
    return timeValue.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // Handle plain HH:mm or HH:mm:ss strings
  if (typeof timeValue === 'string') {
    const parts = timeValue.split(':').map(Number);
    if (parts.length >= 2 && !parts.some(isNaN)) {
      const date = new Date();
      date.setHours(parts[0]);
      date.setMinutes(parts[1]);
      date.setSeconds(parts[2] || 0);
      date.setMilliseconds(0);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  }

  // Fallback: return as-is
  return String(timeValue);
};
