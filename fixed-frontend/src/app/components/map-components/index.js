import dynamic from "next/dynamic";

//Disables server side rendering for the map (gets rid of windows reference error when map loads)
const InteractiveMap = dynamic(() => import("./InteractiveMap"),{
  ssr: false
});
 
export default InteractiveMap;