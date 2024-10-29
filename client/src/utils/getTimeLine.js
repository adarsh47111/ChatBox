export function getTimeLine(timestampString) {
  const timestamp = parseInt(timestampString, 10);
  const date = new Date(timestamp);

  // Get the current date
  const currentDate = new Date();

  // If the date is today, show "Today"
  if (
    date.getDate() === currentDate.getDate() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  ) {
    return "Today";
  }

  // If the date is yesterday, show "Yesterday"
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  // If the date is within the last week, show the day name
  if (
    currentDate - date <= 7 * 24 * 60 * 60 * 1000 &&
    date.getDay() !== currentDate.getDay()
  ) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }

  // Otherwise, show the full date with year
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
