import React from 'react';
import InteractiveMap from './InteractiveMap';

jest.mock('leaflet', () => ({

}));


test('renders InteractiveMap component', () => {
    render(<InteractiveMap />);
  });