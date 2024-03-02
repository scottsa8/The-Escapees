import React from 'react';
import RoomCanvas from './RoomCanvas';
import { render, act, renderHook, fireEvent } from '@testing-library/react';

test('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(<RoomCanvas />);
      container = result.container;
    });
    expect(container).toBeTruthy();
});