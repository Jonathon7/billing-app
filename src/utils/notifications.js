/**
 * @param {string} type
 * @param {string} string
 */
createNotification = (type, title) => {
  return () => {
    switch (type) {
      case "info":
        // NotificationManager.info("Info message");
        break;
      case "success":
        // NotificationManager.success("Successful", title);
        break;
      case "error":
        // NotificationManager.error("Error message", title, 2000);
        break;
    }
  };
};

module.exports = {
  createNotification,
};
