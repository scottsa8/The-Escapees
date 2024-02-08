import React from "react";

const Dial = ({ value, min, max }) => {
    const size = 170; 
    const strokeWidth = 5; 
    const radius = (size-20 - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    
    const offset = circumference - (value - min) / (max - min) * circumference;


    return (
        <div className="dial-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
                {/* circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="white"
                    stroke="#e6e6e6"
                    strokeWidth={strokeWidth}
                />
                {/* border circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="blue"
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
                >
                    {value}
                </text>
            </svg>
        </div>
    );
};

export default Dial;