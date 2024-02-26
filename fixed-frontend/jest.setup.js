import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {
        this.callback([{ contentRect: { width: 1920, height: 1080 } }]);
    }
    unobserve() {}
    disconnect() {}
};

fetchMock.mockResponse(req => {
    if (req.url.includes('/getRooms')) {
      return Promise.resolve(JSON.stringify({
        rooms: {
          data: [
            { room: "Room" },
          ]
        }
      }));
    } else if (req.url.includes('/getEnv')) {
      return Promise.resolve(JSON.stringify({
        "environment": {
          "data": [
            {
              "DataID": "0",
              "Timestamp": "2024-02-18 19:30:59.0",
              "Temperature": "12.74",
              "NoiseLevel": "3.73",
              "LightLevel": "5.92"
            }
          ]
        }
      }));
    } else {
      return Promise.reject('Unknown endpoint');
    }
  });