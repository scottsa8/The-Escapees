import React from "react";
import { useState, useEffect } from "react";

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