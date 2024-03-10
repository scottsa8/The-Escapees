import { useState, useRef } from 'react';
const Notification = ({ notification }) => (
    <div className="notification">
        <h2 className="font-bold">{notification.title}</h2>
        <h3>{notification.options}</h3>
        <p>{notification.timestamp.toLocaleString()}</p>
        <div className="loading-bar"/>
    </div>
);
export function useNotification() {
    const [notifications, setNotifications] = useState([]);
    const timers = useRef({});

    const sendNotification = (title, options) => {
        const id = Date.now(); 
        const timestamp = new Date();
        setNotifications(prevNotifications => [...prevNotifications, { id, title, options, timestamp }]);
        const existingNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        existingNotifications.push({ id, title, options, timestamp });
        localStorage.setItem('notifications', JSON.stringify(existingNotifications));
        
        timers.current[id] = setTimeout(() => {
            setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
            delete timers.current[id];
        }, 2000);
    };

    const NotificationComponent = () => (
        <div className="notification-container">
            {notifications.map(notification => (
                <Notification key={notification.id} notification={notification} />
            ))}
        </div>
    );

    return { sendNotification, NotificationComponent };
}