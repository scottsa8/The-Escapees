import axios from 'axios';
import { network } from "../layout";

/**
 * Fetches data from the specified API endpoint.
 *
 * @param {string} endpoint - The endpoint to fetch data from
 * @return {Promise} The data fetched from the API
 */
export const fetchApi = async (endpoint) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `https://${network.ip}:${network.port}/${endpoint}`
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Filter the data based on a certain condition and return the filtered result.
 *
 * @param {Array} data - The input data to be filtered.
 * @param {boolean} filtered - A boolean indicating whether to apply filtering or not.
 * @return {Array} The filtered array based on the given condition.
 */
const filterData = (data, filtered) => {
    let lastMinute = null;
    return data.reduce((acc, currentData) => {
      const currentMinute = new Date(currentData['Timestamp']).getMinutes();
      if (!filtered || lastMinute === null || lastMinute !== currentMinute) {
        acc.push({
          timestamp: new Date(currentData['Timestamp']),
          temp: currentData['Temperature'],
          noise: currentData['NoiseLevel'],
          light: currentData['LightLevel']
        });
        lastMinute = currentMinute;
      }
      return acc;
    }, []);
  };
  
  /**
   * Retrieves environment data based on the selected room, with optional sorting and filtering.
   *
   * @param {string} selectedRoom - The room for which to retrieve environment data.
   * @param {string} [order="ASC"] - The order in which to retrieve the data, defaults to "ASC".
   * @param {boolean} [filtered=true] - Indicates whether the retrieved data should be filtered to only 1 entry per minute, defaults to true.
   * @return {Promise<any>} The filtered environment data.
   */
  export const getEnvData = async (selectedRoom, order = "ASC", filtered = true) => {
    const response = await axios.get(`https://${network.ip}:${network.port}/getEnv`, {
      params: {
        loc: selectedRoom,
        order: order
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  
    const data = response.data.environment.data;
    const out = filterData(data, filtered);
    return out;
  };

/**
 * Fetches room data from the API and filters out rooms that include 'gate'.
 *
 * @return {Promise<Array>} The room names fetched from the API
 */
export const fetchRoomNames = async () => {
    try {
        const data = await fetchApi('getRooms');
        const roomNames = data.rooms.data
            .map(roomObj => roomObj.room)
            .filter(roomName => !roomName.includes('gate'));
        return roomNames;
    } catch (error) {
        console.error(error);
        return [];
    }
};

