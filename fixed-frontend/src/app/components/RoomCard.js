import { useQuery } from "react-query";
import { fetchApi } from "./apiFetcher";
import { motion } from "framer-motion";

const RoomCard = ({roomName, onClick, isSelected}) => {

    const fetchInmateCount = () => fetchApi(`getPeople?loc=${roomName}&type=inmate`);
    const fetchGuardCount = () => fetchApi(`getPeople?loc=${roomName}&type=guard`);

    const { data: inmateCount = 0, isLoading: isLoadingInmateCount } = useQuery(['inmateCount', roomName], fetchInmateCount);
    const { data: guardCount = 0, isLoading: isLoadingGuardCount } = useQuery(['guardCount', roomName], fetchGuardCount);

    if (isLoadingInmateCount || isLoadingGuardCount) return 'Loading...';

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
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Prisoners: ${inmateCount}`}</p>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Guards: ${guardCount}`}</p>
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Total: ${guardCount+inmateCount}`}</p>
      </motion.div>
    );
}
 
export default RoomCard;