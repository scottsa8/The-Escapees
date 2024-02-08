export function sendNotification(title, options) {
    // Check browser support
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
  
    // Check for permission
    else if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  
    // Request permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  
}