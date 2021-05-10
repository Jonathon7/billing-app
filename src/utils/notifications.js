/**
 * @param {Component} NotificationManager - named import from npm package
 * @param {string} type
 * @param {string} string
 */
createNotification = (NotificationManager, type, title) => {
  return () => {
    switch (type) {
      case "info":
        NotificationManager.info("Info message");
        break;
      case "success":
        NotificationManager.success("Successful", title);
        break;
      case "warning":
        NotificationManager.warning(
          "Warning message",
          "Close after 3000ms",
          3000
        );
        break;
      case "error":
        NotificationManager.error("Error message", "Click me!", 5000, () => {
          alert("callback");
        });
        break;
    }
  };
};

module.exports = {
  createNotification,
};
