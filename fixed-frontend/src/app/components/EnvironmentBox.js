import Dial from "./dial";

const EnvironmentBox = ({measurement, value, max}) => {
    return ( 
    <div className="flex flex-col items-center p-4 bg-transparent">
        <Dial value={value} min={0} max={max} onMaxValue={() => {
            sendNotification('Max Value Reached', { body: `Measurement: ${measurement}, Value: ${value}`});
        }}/>
        <span className="text-lg font-medium mt-2">{measurement}</span>
    </div> 
    );
}
 
export default EnvironmentBox;