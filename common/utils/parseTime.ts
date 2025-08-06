/**
 * Converts a time string in "HH:MM" format to the total number of minutes.
 * 
 * @param {string} time - The time string to parse, in "HH:MM" format.
 * @returns {number | null} The total minutes, or null if the input is invalid.
 */
function parseTimeToMinutes(time: string): number | null {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

export default parseTimeToMinutes;