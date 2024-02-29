import axios from 'axios';

export const fetchApi = async (url, method, data) => {
    try {
        const response = await axios({
        method: method,
        url: url,
        data: data
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
};