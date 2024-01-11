import * as turf from '@turf/turf';
import { SlowZone } from './types';

const findRelevantLineStrings = (lines, startStop, endStop) => {
  const relevantLines = [];

  for (const line of lines) {
    // Using nearestPointOnLine to find the nearest points on this line for both start and end stops
    const startNearestPoint = turf.nearestPointOnLine(line, startStop);
    const endNearestPoint = turf.nearestPointOnLine(line, endStop);

    // Calculate distances from stops to their nearest points on the line
    const startDistance = turf.distance(startStop, startNearestPoint);
    const endDistance = turf.distance(endStop, endNearestPoint);

    // If both distances are within a reasonable threshold, consider this LineString as relevant
    if (startDistance <= 0.1 && endDistance <= 0.1 && line.geometry.coordinates.length > 2) {
      relevantLines.push(line);
    }
  }

  return relevantLines;
};

const combineLineStrings = (lineStrings) => {
  const allCoords = lineStrings.flatMap((line) => line.geometry.coordinates);
  return allCoords;
};

const findClosestIndex = (coords, point) => {
  let minDistance = Infinity;
  let closestIndex = -1;

  for (let i = 0; i < coords.length; i++) {
    const currentDistance = turf.distance(coords[i], point);
    if (currentDistance < minDistance) {
      minDistance = currentDistance;
      closestIndex = i;
    }
  }

  return closestIndex;
};

const trimLineString = (combinedCoords, startStop, endStop) => {
  // Finding the index of the closest coordinate to start and end stops
  const startIndex = findClosestIndex(combinedCoords, startStop);
  const endIndex = findClosestIndex(combinedCoords, endStop);

  // If both indices are found
  if (startIndex !== -1 && endIndex !== -1) {
    // If the end stop comes before the start stop in the array, swap the indices
    if (startIndex > endIndex) {
      return combinedCoords.slice(endIndex, startIndex + 1).reverse();
    } else {
      return combinedCoords.slice(startIndex, endIndex + 1);
    }
  }
  return null;
};

export const getSlowZoneSegments = (slowZones: SlowZone[], lines, stops) => {
  const newHighlightedSegments: any = [];

  for (const slowZone of slowZones) {
    const startStop = stops.features.find((s) => s.properties.stop_id === slowZone.fr_id);
    const endStop = stops.features.find((s) => s.properties.stop_id === slowZone.to_id);

    const relevantLines = findRelevantLineStrings(
      lines.features,
      startStop.geometry.coordinates,
      endStop.geometry.coordinates
    );
    const combinedCoords = combineLineStrings(relevantLines);
    const trimmedCoords = trimLineString(
      combinedCoords,
      startStop.geometry.coordinates,
      endStop.geometry.coordinates
    );

    if (trimmedCoords.length > 1) {
      newHighlightedSegments.push({
        type: 'Feature',
        properties: {
          ...slowZone,
          name: `${startStop.properties.stop_name} - ${endStop.properties.stop_name}`,
        },
        geometry: {
          type: 'LineString',
          coordinates: trimmedCoords,
        },
      });
    }
  }
  return newHighlightedSegments;
};
