import { setCookie } from "../components/cookies";
import EnviromentContainer from "../components/enviroment";
import LocationCountBox from "../components/locationNumber";

const HomePage = () => {
    setCookie("types","inmates,guards")
    return (
        <>
            <EnviromentContainer/>
            {/* <LocationCountBox/> */}
        </>
    );    
}
 
export default HomePage;