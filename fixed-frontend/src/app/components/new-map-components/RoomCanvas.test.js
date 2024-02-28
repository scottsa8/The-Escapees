import React from 'react';
import RoomCanvas from './RoomCanvas';

test('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(<RoomCanvas />);
      container = result.container;
    });
    expect(container).toBeTruthy();
  });

