const getCurrentTimeIn12HourFormat = (timestampString) => {
  const timestamp = parseInt(timestampString, 10);

  // Ensure the timestamp is in milliseconds
  const date = new Date(timestamp);

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Add leading zero to minutes if necessary
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // Construct the time string
  const timeString = hours + ":" + formattedMinutes + " " + ampm;

  return timeString;
};

export { getCurrentTimeIn12HourFormat };
