import {
  durationToMinutes,
  formatDate,
  formatMinutes,
  formatTime,
  getDateMetadata,
} from "../utils/formatters";

export function minutesToDurationStr(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h 0m`;
  return `0h ${minutes}m`;
}

export function calcDurationMinutes(startHHMM, endHHMM) {
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  return end - start;
}

export function timeLabelFromRow(row) {
  if (row.time_mode === "estimated") {
    return `تقديري · ${formatMinutes(row.duration_minutes)}`;
  }
  if (row.start_time && row.end_time) {
    const start = String(row.start_time).slice(0, 5);
    const end = String(row.end_time).slice(0, 5);
    return `${formatTime(start)} - ${formatTime(end)}`;
  }
  return formatMinutes(row.duration_minutes);
}

export function mapRowToUi(row) {
  const dateObj = new Date(`${row.activity_date}T12:00:00`);
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    date: formatDate(dateObj),
    dateMetadata: getDateMetadata(dateObj),
    activityDate: row.activity_date,
    time: timeLabelFromRow(row),
    duration: minutesToDurationStr(row.duration_minutes),
    durationMinutes: row.duration_minutes,
    timeMode: row.time_mode,
    startTime: row.start_time ? String(row.start_time).slice(0, 5) : null,
    endTime: row.end_time ? String(row.end_time).slice(0, 5) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseEstimatedInput(hoursStr, minutesStr) {
  const hours = Math.max(0, parseInt(hoursStr || "0", 10) || 0);
  const minutes = Math.max(0, parseInt(minutesStr || "0", 10) || 0);
  return hours * 60 + minutes;
}

export { durationToMinutes, formatMinutes, formatDate, formatTime };
