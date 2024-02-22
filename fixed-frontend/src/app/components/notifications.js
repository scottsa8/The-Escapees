import { useState, useEffect } from 'react';

export function useNotification() {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationOptions, setNotificationOptions] = useState('');

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    const sendNotification = (title, options) => {
        setNotificationTitle(title);
        setNotificationOptions(options);
        setShowNotification(true);
    };

    const NotificationComponent = () => (
        showNotification && (
            <div className="absolute bottom-10 rounded-lg shadow-lg left-20 p-4 z-20 bg-sky-600 ">
                <h2>{notificationTitle}</h2>
                <h3>{notificationOptions}</h3>
            </div>
        )
    );

    return { sendNotification, NotificationComponent };
}