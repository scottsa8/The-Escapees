import { useQuery } from "react-query";
import { fetchApi } from "./apiFetcher";

const RoomCard = ({roomName, onClick, isSelected}) => {

    const fetchInmateCount = () => fetchApi(`getPeople?loc=${roomName}&type=inmate`);
    const fetchGuardCount = () => fetchApi(`getPeople?loc=${roomName}&type=guard`);

    const { data: inmateCount = 0, isLoading: isLoadingInmateCount } = useQuery(['inmateCount', roomName], fetchInmateCount);
    const { data: guardCount = 0, isLoading: isLoadingGuardCount } = useQuery(['guardCount', roomName], fetchGuardCount);

    if (isLoadingInmateCount || isLoadingGuardCount) return 'Loading...';

      const cardStyle = isSelected 
      ? {color: 'DBE9FE', backgroundColor: '#1B2030', cursor: 'pointer' } 
      : (guardCount <= inmateCount * 0.25 && inmateCount !== 0)
          ? { backgroundColor: '#5c251a', cursor: 'pointer' } 
          : { cursor: 'pointer' };

    return (
      <div onClick={onClick} style={cardStyle} className="bg-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 dark:bg-gray-700 dark:text-blue-100">
        <h2 className="text-xl font-semibold text-gray-600 dark:text-blue-300">{`${roomName}`}</h2>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Prisoners: ${inmateCount}`}</p>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Guards: ${guardCount}`}</p>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Total: ${guardCount+inmateCount}`}</p>
      </div>
    );
}
 
export default RoomCard;