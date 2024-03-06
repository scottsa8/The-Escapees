import React from "react";
import { useState, useEffect } from "react";

/**
 * Dial Component
 * 
 * This is a circular dial component that visually represents a value within a range.
 * 
 * @component
 * @param {string} className - The CSS class to apply to the component's outer div.
 * @param {number} value - The current value to be represented by the dial.
 * @param {number} min - The minimum value in the range.
 * @param {number} max - The maximum value in the range.
 * @param {function} onMaxValue - The function to be called when the value reaches or exceeds the max value.
 * @param {number} [size=170] - The size of the dial in pixels. Default is 170.
 * 
 * @example
 * <Dial className="myDial" value={50} min={0} max={100} onMaxValue={() => console.log("Max value reached")} size={200} />
 * 
 * @returns {JSX.Element} The Dial component
 */
function Dial({className, value, min, max, onMaxValue, size = 170 }) {

    const strokeWidth = 5; 
    const radius = (size-20 - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    
    const offset = circumference - (value - min) / (max - min) * circumference;

    useEffect(() => {
        if (value >= max) {
            onMaxValue();
        }
    }, [value]);
    

    return (
        <div className={className}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
                {/* circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="#374151"
                    stroke="#e6e6e6"
                    strokeWidth={strokeWidth}
                />
                {/* border circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="red"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
                {/* value */}
                <text
                    x="50%"
                    y="50%"
                    dy=".3em"
                    textAnchor="middle"
                    fontSize="1.7em"
                    fontWeight="bold"
                    fill="rgb(219 234 254)"
                >
                    {value}
                </text>
            </svg>
        </div>
    );
};

export default Dial;