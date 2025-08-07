/**
 * Combines a Date object (representing the day) with a time string ("HH:MM") to create a new Date object.
 * The resulting Date will have the same year, month, and day as the input date, but the time set to the provided hours and minutes.
 *
 * @param {Date} day - The date representing the day.
 * @param {string} time - The time string in "HH:MM" format.
 * @returns {Date} A new Date object with the combined date and time.
 */
export function combineDateAndTime(day: Date, time: string): Date {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(day);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}
