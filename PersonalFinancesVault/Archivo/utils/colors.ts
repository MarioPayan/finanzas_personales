export const backgroundColorGradiant = (value: number): string => {
    // Get a value between -100 and 100 and return a color between red and green
    const ratio = (value + 100) / 200;
    const red = Math.round(255 * (1 - ratio));
    const green = Math.round(255 * ratio);
    return `rgb(${red},${green},0)`;
  }