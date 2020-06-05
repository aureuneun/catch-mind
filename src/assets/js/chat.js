import { getSocket } from "./sockets";

const messages = document.getElementById("jsMessages");
const sendMsg = document.getElementById("jsSendMsg");

const appendMsg = (text, nickname) => {
  const li = document.createElement("li");
  li.className = nickname ? "out" : "self";
  li.innerHTML = `
    <span class="author">${
      nickname ? nickname : ""
    }</span> <span class="text">${text}</span>
    `;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
};

const handleSendMsg = (e) => {
  e.preventDefault();
  const input = sendMsg.querySelector("input");
  const { value } = input;
  input.value = "";
  appendMsg(value, null);
  getSocket().emit(window.events.sendMsg, { message: value });
};

export const handleNewMsg = ({ message, nickname }) => {
  appendMsg(message, nickname);
};

if (sendMsg) {
  sendMsg.addEventListener("submit", handleSendMsg);
}
