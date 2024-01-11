import { LayerProps } from 'react-map-gl';

export const stopsLayer: LayerProps = {
  id: 'stop-data',
  type: 'circle',
  paint: {
    'circle-color': 'white',
    'circle-stroke-width': 1,
    'circle-radius': 2,
  },
};
