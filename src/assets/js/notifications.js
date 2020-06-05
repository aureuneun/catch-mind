const notifications = document.querySelector("body");

const fireNotification = (text, color) => {
  const notification = document.createElement("div");
  notification.innerHTML = text;
  notification.style.backgroundColor = color;
  notification.className = "notification";
  notifications.appendChild(notification);
};

export const handleNewUser = ({ nickname }) =>
  fireNotification(`${nickname} just joined!`, "rgb(0, 122, 255)");

export const handleDisconnected = ({ nickname }) =>
  fireNotification(`${nickname} just left!`, "rgb(255, 59, 48)");
