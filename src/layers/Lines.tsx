import { useEffect, useState } from 'react';
import { Layer, Popup, Source, useMap } from 'react-map-gl';

import red from '../../data/red.json';
import blue from '../../data/blue.json';
import orange from '../../data/orange.json';
import green from '../../data/green.json';
import { getSlowZoneSegments } from './utils';
import { stopsLayer } from './stopsLayer';
import { Line, SlowZone, Stop } from './types';

const LINE_DATA = {
  Orange: orange,
  Red: red,
  Blue: blue,
  Green: green,
};

const SLOW_ZONE_COLORS = {
  Red: '#FF7070',
  Orange: '#b35900',
  Blue: '#5078D8',
  Green: '#005532',
  Bus: '#b39b00',
};

export const Lines = ({ line, slowZones }: { line: string; slowZones?: SlowZone[] }) => {
  const map = useMap();
  const [lineData, setLineData] = useState<{ type: 'FeatureCollection'; features: Line[] }>();
  const [stopData, setStopData] = useState<{ type: 'FeatureCollection'; features: Stop[] }>();
  const [highlightedSegments, setHighlightedSegments] = useState([]);
  const [lineDashArray, setLineDashArray] = useState([0, 4, 3]);
  const [popupInfo, setPopupInfo] = useState(null); // This state will hold the data and position for the popup

  useEffect(() => {
    if (!LINE_DATA[line]) return;

    const lines = LINE_DATA[line].features.filter((ft) => ft.geometry.type === 'LineString');
    const stops = LINE_DATA[line].features.filter((ft) => ft.geometry.type === 'Point');

    setLineData({
      type: 'FeatureCollection',
      features: lines,
    });
    setStopData({
      type: 'FeatureCollection',
      features: stops,
    });
  }, [line]);

  useEffect(() => {
    if (slowZones && lineData && stopData && line !== 'Green') {
      const szSegments = getSlowZoneSegments(
        slowZones.filter((sz) => sz.color === line),
        lineData,
        stopData
      );
      setHighlightedSegments(szSegments);
    }
  }, [line, lineData, slowZones, stopData]);

  useEffect(() => {
    // Function to show popup
    const showPopup = (e) => {
      const feature = e.features[0];

      setPopupInfo({
        lngLat: e.lngLat,
        data: feature.properties, // Assuming your stop data is in properties
      });
    };

    // Function to hide popup
    const hidePopup = () => {
      setPopupInfo(null);
    };

    map.current.on('mouseenter', `interaction-stops-data-${line}`, showPopup);
    map.current.on('mouseleave', `interaction-stops-data-${line}`, hidePopup);

    // Cleanup event listeners on unmount
  }, [map, line]);

  return (
    <>
      <Source id={`line-data-${line}`} type="geojson" data={lineData as any}>
        <Layer
          type="line"
          id={`line-data-${line}`}
          paint={{
            'line-color': ['get', 'route_color'],
            'line-width': 6,
          }}
        />
      </Source>
      <Source id={`stops-data-${line}`} type="geojson" data={stopData as any}>
        <Layer
          id={`visible-stops-data-${line}`}
          type="circle"
          paint={{
            'circle-radius': 2, // The actual visible size of your stops
            'circle-color': 'white', // The color of your stops
          }}
        />
      </Source>
      <Source
        id={`highlighted-lines-${line}`}
        type="geojson"
        data={{ type: 'FeatureCollection', features: highlightedSegments }}
      >
        <Layer
          id={`highlighted-lines-${line}`}
          type="line"
          layout={{ 'line-cap': 'round' }}
          paint={{
            'line-color': 'yellow',
            'line-width': 1,
          }}
        />
      </Source>
      <Source id={`stops-data-${line}`} type="geojson" data={stopData as any}>
        <Layer
          id={`interaction-stops-data-${line}`}
          type="circle"
          paint={{
            'circle-radius': 4, // Adjust this for your desired buffer size
            'circle-color': 'rgba(0, 0, 0, 0)', // Completely transparent
          }}
        />
      </Source>
      {popupInfo && (
        <Popup
          longitude={popupInfo.lngLat.lng}
          latitude={popupInfo.lngLat.lat}
          closeButton={false}
          closeOnClick={false}
        >
          <div>
            {/* Display data from popupInfo.data as desired */}
            {popupInfo.data.stop_name}{' '}
            {/* This is just an example, structure your popup content as needed */}
          </div>
        </Popup>
      )}
    </>
  );
};
