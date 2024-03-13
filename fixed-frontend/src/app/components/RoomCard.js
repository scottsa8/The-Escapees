import { useQuery } from "react-query";
import { fetchApi } from "./apiFetcher";
import { motion } from "framer-motion";

const RoomCard = ({roomName, onClick, isSelected}) => {

    const { data: types } = useQuery('getTypes', () => fetchApi(`getTypes`));
    const fetchCounts = async () => {
      const counts = {};
      for (const type of types) {
      const { data } = await fetchApi(`getPeople?loc=${roomName}&type=${type}`);
      counts[type] = data.length;
      }
      return counts;
    };
    const { data: counts = {}, isLoading: isLoadingCounts } = useQuery(['counts', roomName], fetchCounts);

    if (isLoadingCounts) return 'Loading...';

      const cardStyle = isSelected 
      ? "bg-blue-300 dark:bg-sky-700 text-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 cursor-pointer" 
      : (guardCount <= inmateCount * 0.25 && inmateCount !== 0)
          ? "bg-red-500 dark:bg-red-700 text-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 cursor-pointer" 
          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-blue-100 shadow-md rounded-lg p-4 m-4 max-w-sm w-60 cursor-pointer";

    return (
      <motion.div onClick={onClick} className={cardStyle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-blue-300">{`${roomName}`}</h2>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`${types[0]}: ${counts[0]}`}</p>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`${types[1]}: ${counts[1]}`}</p>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Total: ${counts[0]+counts[1]}`}</p>
      </motion.div>
    );
}
 
export default RoomCard;