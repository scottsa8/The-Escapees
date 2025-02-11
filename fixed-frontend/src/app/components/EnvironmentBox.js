import Dial from "./dial";
import { useNotification } from "./notifications";
import { getCookie } from "./cookies";

const EnvironmentBox = ({size, dialClassName, measurement, value, max}) => {
        const { sendNotification, NotificationComponent } = useNotification();
    return ( 
    <div className="flex flex-col items-center p-4 bg-transparent">
        <Dial className={dialClassName} size={size} value={value} min={0} max={max}/>
        <span className="text-lg font-medium mt-2">{measurement}</span>
    <NotificationComponent className="bottom-1" />
    </div> 
    );
}
 
export default EnvironmentBox;