import Dial from "./dial";
import { sendNotification } from "./notifications";

<<<<<<< HEAD
const EnvironmentBox = ({measurement, value, max}) => {
    return ( 
    <div className="flex flex-col items-center p-4 bg-transparent">
        <Dial value={value} min={0} max={max} onMaxValue={() => {
=======
const EnvironmentBox = ({measurement, value, size}) => {
    return ( 
    <div className="flex flex-col items-center p-4 bg-transparent">
        <Dial size={size} value={value} min={0} max={100} onMaxValue={() => {
>>>>>>> 3930e359a550003fb627787be3ad5862e6188b60
            sendNotification('Max Value Reached', { body: `Measurement: ${measurement}, Value: ${value}`});
        }}/>
        <span className="text-lg font-medium mt-2">{measurement}</span>
    </div> 
    );
}
 
export default EnvironmentBox;