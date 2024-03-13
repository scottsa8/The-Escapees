import { useQuery, useQueries } from "react-query";
import { fetchApi } from "./apiFetcher";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {getCookie,setCookie} from "./cookies";

const RoomCard = ({roomName, onClick, isSelected}) => {
    const { data: types, isError, isLoading } = useQuery('getTypes', () => fetchApi(`getTypes`));
    const userCounts = useQueries(types.map(type => ({
      queryKey: ['getPeople', roomName, type],
      queryFn: () => fetchApi(`getPeople?loc=${roomName}&type=${type}`),
    })));

    
    useEffect(() => {
      if (!isLoading && !typesLoading) {
        console.log(userCounts);
        console.log(types);
      }
    }, [isLoading, typesLoading, userCounts, types]);
  
      const cardStyle = isSelected 
      ? "bg-blue-300 dark:bg-sky-700 text-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 cursor-pointer" 
      : (counts[0] <= counts[1] * 0.25 && counts[1] !== 0 && fetchApi('getDomain') === 'Prison')
          ? "bg-red-500 dark:bg-red-700 text-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 cursor-pointer" 
          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-blue-100 shadow-md rounded-lg p-4 m-4 max-w-sm w-60 cursor-pointer";

    return (
      <motion.div onClick={onClick} className={cardStyle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-blue-300">{`${roomName}`}</h2>
        {types.map((type, index) => (
          <p key={index} className="text-gray-500 mt-2 dark:text-blue-100">{`${type.charAt(0).toUpperCase() + type.slice(1)}: ${counts[type]}`}</p>
        ))}
        <p className="text-gray-500 mt-2 dark:text-blue-100">{`Total: ${Object.values(counts).reduce((sum, count) => sum + count, 0)}`}</p>
      </motion.div>
    );
}
 
export default RoomCard;