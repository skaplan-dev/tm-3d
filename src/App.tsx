import { Map, Marker, NavigationControl } from 'react-map-gl';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState } from 'react';
import { Lines } from './layers/Lines';
import dayjs from 'dayjs';
import { SlowZone } from './layers/types';

function App() {
  const [slowZones, setSlowZones] = useState<SlowZone[]>();
  const [trains, setTrains] = useState<any>();

  useEffect(() => {
    const fetchTrains = async () => {
      const trains = await fetch(
        'https://traintracker.transitmatters.org/trains/Blue,Green-B,Green-C,Green-D,Green-E,Orange,Red-A,Red-B'
      ).then((resp) => resp.json());

      setTrains(trains);
      console.log(trains);
    };
    const fetchData = async () => {
      const slowZones = await fetch(
        'https://dashboard.transitmatters.org/static/slowzones/all_slow.json'
      ).then((resp) => resp.json());

      const activeSlowzones = slowZones.filter((sz) =>
        dayjs(sz.end).isSame(dayjs().subtract(1, 'day'), 'day')
      );
      setSlowZones(activeSlowzones);
    };

    fetchTrains();
    setInterval(fetchTrains, 5000);
    fetchData();
  }, []);

  return (
    <Map
      reuseMaps
      mapLib={import('mapbox-gl')}
      initialViewState={{
        longitude: -71.0995,
        latitude: 42.3155,
        zoom: 11,
        pitch: 30,
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle="mapbox://styles/smilerk/clo06apud00az01qxe9nle0g6"
      mapboxAccessToken={import.meta.env.VITE_MapboxAccessToken}
    >
      <NavigationControl position="top-left" />

      <Lines line="Orange" slowZones={slowZones} />
      <Lines line="Red" slowZones={slowZones} />
      <Lines line="Blue" slowZones={slowZones} />
      <Lines line="Green" slowZones={slowZones} />
      {trains &&
        trains.map((train, index) => {
          return (
            <Marker key={index} longitude={train.longitude} latitude={train.latitude}>
              <img
                src="../public/favicon.png"
                alt="custom-marker"
                style={{ width: '15px', height: '15px' }}
              />
            </Marker>
          );
        })}
    </Map>
  );
}

export default App;
