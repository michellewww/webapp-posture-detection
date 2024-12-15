export const updateFaviconColors = async (color) => {
  // Fetch the original SVG file
  const response = await fetch('./favicon.svg');
  let svg = await response.text();

  // Replace the fill color dynamically
  svg = svg.replace(/fill="[^"]*"/, `fill="${color}"`);

  // Convert modified SVG to a data URL
  const encodedSvg = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  // Update the favicon link
  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.setAttribute('href', encodedSvg);
  }
};