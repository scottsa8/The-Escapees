import Dial from "./dial";
import { useNotification } from "./notifications";

const EnvironmentBox = ({size, dialClassName, measurement, value, max}) => {
    const { sendNotification, NotificationComponent } = useNotification();
    return ( 
    <div className="flex flex-col items-center p-4 bg-transparent">
        <Dial className={dialClassName} size={size} value={value} min={0} max={max} onMaxValue={() => {
            sendNotification('Max Value Reached', 'Measurement: ${measurement}, Value: ${value}');
        }}/>
        <span className="text-lg font-medium mt-2">{measurement}</span>
    <NotificationComponent />
    </div> 
    );
}
 
export default EnvironmentBox;