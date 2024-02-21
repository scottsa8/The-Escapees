import Dial from "./dial";
import { sendNotification } from "./notifications";

const EnvironmentBox = ({dialClassName, measurement, value, size}) => {
    return ( 
    <div className="flex flex-col items-center p-4 bg-transparent">
        <Dial className = {dialClassName} size={size} value={value} min={0} max={100} onMaxValue={() => {
            sendNotification('Max Value Reached', { body: `Measurement: ${measurement}, Value: ${value}`});
        }}/>
        <span className="text-lg font-medium mt-2">{measurement}</span>
    </div> 
    );
}
 
export default EnvironmentBox;