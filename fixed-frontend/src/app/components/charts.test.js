import React from 'react';
import { render, act, renderHook, fireEvent } from '@testing-library/react';
import Chart from './charts';
import {getCookie, setCookie} from './cookies';
import { useNotification, NotificationComponent } from './notifications';
import Settings from './settings';

test('renders without crashing', async () => {
  let container;
  await act(async () => {
    const result = render(<Chart />);
    container = result.container;
  });
  expect(container).toBeTruthy();
});

describe('cookies', () => {
  test('setCookie sets a cookie', () => {
    setCookie('test', 'value');
    expect(document.cookie).toContain('test=value');
  });

  test('getCookie retrieves a cookie value', () => {
    document.cookie = 'test=value';
    const value = getCookie('test');
    expect(value).toBe('value');
  });

  test('getCookie returns null if cookie is not found', () => {
    const value = getCookie('nonexistent');
    expect(value).toBeNull();
  });
});

describe('useNotification', () => {
  test('notification component renders initialy as null', () => {
    const { result } = renderHook(() => useNotification());
    const { NotificationComponent } = result.current;
    const { queryByText } = render(<NotificationComponent />);
    expect(queryByText(/./)).toBeNull();
  });
});


describe('Settings', () => {
  test('renders without crashing', () => {
    render(<Settings />);
  });
});