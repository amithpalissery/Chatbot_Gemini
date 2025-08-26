const userInput = document.getElementById('user-query');
const sendButton = document.getElementById('send-button');
const chatContainer = document.querySelector('.chat-container');

// Function to add a message to the chat container
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bard-message');
    messageDiv.innerHTML = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

sendButton.addEventListener('click', async () => {
    const userMessage = userInput.value.trim();

    if (userMessage !== '') {
        // Clear the input field immediately
        userInput.value = '';

        // Add user's message to the chat
        addMessage(userMessage, 'user');

        // Show a loading message while waiting for the bot
        addMessage('...', 'bard');

        try {
            // Use the fetch API to send the user's question to your Flask server
            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'question': userMessage
                })
            });

            // Parse the HTML response from the Flask server
            const htmlResponse = await response.text();
            
            // This is a simple way to parse the HTML and find the bot's message
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlResponse, 'text/html');
            const botMessageFromFlask = doc.querySelector('.bard-message'); // You need to have this class in your question.html template

            // Remove the loading message and add the bot's real message
            chatContainer.removeChild(chatContainer.lastChild);
            if (botMessageFromFlask) {
                 addMessage(botMessageFromFlask.innerHTML, 'bard');
            } else {
                 addMessage("Sorry, I could not get a response.", "bard");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Remove the loading message and show an error
            chatContainer.removeChild(chatContainer.lastChild);
            addMessage("Sorry, an error occurred while connecting to the server.", "bard");
        }
    }
});

// Optional: Add event listener for "Enter" key press
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});
