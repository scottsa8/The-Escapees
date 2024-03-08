import { useState, useRef } from 'react';

export function useNotification() {
    const [notifications, setNotifications] = useState([]);
    const timers = useRef({});

    const sendNotification = (title, options) => {
        const id = Date.now(); 
        const timestamp = new Date();
        setNotifications(prevNotifications => [...prevNotifications, { id, title, options, timestamp }]);

        timers.current[id] = setTimeout(() => {
            setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
            delete timers.current[id];

            const existingNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
            existingNotifications.push({ id, title, options, timestamp });
            localStorage.setItem('notifications', JSON.stringify(existingNotifications));
        }, 3000);
    };

    const NotificationComponent = () => (
        notifications.map((notification, index) => (
            <div key={notification.id} className="notification" style={{ bottom: `${10 + index * 110}px` }}>
                <h2 className="font-bold">{notification.title}</h2>
                <h3>{notification.options}</h3>
                <p>{notification.timestamp.toLocaleString()}</p>
                <div className="loading-bar"/>
            </div>
        ))
    );

    return { sendNotification, NotificationComponent };
}