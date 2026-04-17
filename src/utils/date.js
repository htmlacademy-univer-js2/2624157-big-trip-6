import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const formatEventDate = (date) => dayjs(date).format('MMM D').toUpperCase();

export const formatTime = (date) => dayjs(date).format('HH:mm');

export const formatDateTime = (date) => dayjs(date).format('DD/MM/YY HH:mm');

export const formatDateForInput = (date) => dayjs(date).format('DD/MM/YY HH:mm');

export const formatDuration = (start, end) => {
  const diffMs = dayjs(end).diff(dayjs(start));
  const dur = dayjs.duration(diffMs);

  const days = Math.floor(dur.asDays());
  const hours = dur.hours();
  const minutes = dur.minutes();

  if (days > 0) {
    return `${days}D ${hours}H ${minutes}M`;
  }
  if (hours > 0) {
    return `${hours}H ${minutes}M`;
  }
  return `${minutes}M`;
};
