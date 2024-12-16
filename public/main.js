const socket = io();

const clientTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

// Listen for total clients update
socket.on("clients-total", (data) => {
  clientTotal.textContent = `Total Clients: ${data}`;
});

function sendMessage() {
  if (messageInput.value === "") return;
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("Message", data);
  addMessageToUI(true, data);
}

// Listen for incoming chat messages
socket.on("chat-message", (data) => {
  addMessageToUI(false, data);
  messageInput.value = "";
});

// Add a new message to the UI
function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = ` 
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
      <p class="message">
        ${data.message}
        <span>${data.name} ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>`;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Scroll to the bottom of the message container
function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Emit feedback when the user starts typing
messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `🤫${nameInput.value} is typing a message...`,
  });
});

// Emit feedback when the user stops typing
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: `${nameInput.value} stopped typing...`,
  });
});

// Emit an empty feedback when the user is typing
messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

// Listen for feedback from the server and display it
socket.on("feedback", (feedback) => {
  clearFeedback();
  const element = `
    <li class="message-feedback">  
      <p class="feedback" id="feedback">${feedback.feedback}</p>
    </li>
  `;
  messageContainer.innerHTML += element;
});

// Clear existing feedback messages from the UI
function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
