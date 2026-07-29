console.log("script.js loaded");

const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const input = document.getElementById("input");
const dateElement = document.getElementById("headerDate");


// Auto Current Date
const today = new Date();

const options = {
    day: "2-digit",
    month: "short",
    year: "numeric"
};

dateElement.textContent = today.toLocaleDateString("en-GB", options);

// Scroll to Bottom
function scrollBottom() {
    chat.scrollTop = chat.scrollHeight;
}

// Add Message
function addMessage(sender, text) {

    const message = document.createElement("div");
    message.className = sender;

    const bubble = document.createElement("p");
    bubble.textContent = text;

    message.appendChild(bubble);

    chat.appendChild(message);

    scrollBottom();
}

// Show Typing
function showTyping() {

    const typing = document.createElement("div");

    typing.className = "bot";
    typing.id = "typing";

    typing.innerHTML = `
        <p>Typing<span id="dots">.</span></p>
    `;

    chat.appendChild(typing);

    scrollBottom();

    let count = 1;

    typing.timer = setInterval(() => {

        count++;

        if (count > 3) count = 1;

        const dots = document.getElementById("dots");

        if (dots) {
            dots.textContent = ".".repeat(count);
        }

    }, 400);

}

// Remove Typing
function removeTyping() {

    const typing = document.getElementById("typing");

    if (typing) {
        clearInterval(typing.timer);
        typing.remove();
    }

}

// Send Message
async function sendMessage() {

    const userMessage = input.value.trim();

    if (userMessage === "") return;

    addMessage("user", userMessage);

    input.value = "";

    showTyping();

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: userMessage
            })

        });

        const data = await response.json();

        removeTyping();

        if (data.success) {

            addMessage("bot", data.reply);

        } else {

            addMessage("bot", "Something went wrong.");

        }

    } catch (error) {

        console.error(error);

        removeTyping();

        addMessage("bot", "Unable to connect to server.");

    }

}

// Form Submit
chatForm.addEventListener("submit", function (e) {

    e.preventDefault();

    sendMessage();

});

// Toggle chat visibility when mascot is clicked with smooth "emerge" animation
const chatContainer = document.querySelector('.chat-container');
const mascot = document.querySelector('.mascot');

if (mascot && chatContainer) {
    mascot.style.cursor = 'pointer';
    console.log('mascot click handler attached');

    // ensure aria state
    if (!chatContainer.hasAttribute('aria-expanded')) {
        chatContainer.setAttribute('aria-expanded', 'true');
    }

    mascot.addEventListener('click', () => {
        console.log('mascot clicked — toggling chat collapse');

        const isHidden = chatContainer.classList.contains('hidden');
        const isCollapsed = chatContainer.classList.contains('collapsed');

        // If currently hidden/closed -> open it with transition
        if (isHidden || isCollapsed) {
            // reveal from display:none first
            chatContainer.classList.remove('hidden');

            // allow the browser one frame to register the removal, then remove collapsed to play transition
            requestAnimationFrame(() => {
                chatContainer.classList.remove('collapsed');
            });

            chatContainer.setAttribute('aria-expanded', 'true');

            const onOpen = (e) => {
                // focus input after transition completes
                if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
                    scrollBottom();
                    input.focus();
                    chatContainer.removeEventListener('transitionend', onOpen);
                }
            };

            chatContainer.addEventListener('transitionend', onOpen);

        } else {
            // close: add collapsed to start animation, then hide from layout when transition ends
            chatContainer.classList.add('collapsed');
            chatContainer.setAttribute('aria-expanded', 'false');

            const onClose = (e) => {
                if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
                    chatContainer.classList.add('hidden');
                    chatContainer.removeEventListener('transitionend', onClose);
                }
            };

            chatContainer.addEventListener('transitionend', onClose);
        }
    });
}





document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.querySelector(".chat-container");
    const mascot = document.querySelector(".mascot");
    const mascotCloud = document.querySelector(".mascot-cloud");

    // Mascot ya Message Cloud par click karne par chat toggle hoga
    function toggleChat() {
        chatContainer.classList.toggle("collapsed");

        // Tooltip text change karein
        if (chatContainer.classList.contains("collapsed")) {
            if (mascotCloud) mascotCloud.textContent = "Talk to AI";
        } else {
            if (mascotCloud) mascotCloud.textContent = "Close Chat ✖";
            // Open hone par input field par auto-focus ho jayega
            const inputField = document.getElementById("input");
            if (inputField) inputField.focus();
        }
    }

    // Event Listeners
    if (mascot) {
        mascot.addEventListener("click", toggleChat);
    }
    
    if (mascotCloud) {
        mascotCloud.style.pointerEvents = "auto"; // Cloud ko bhi clickable banayein
        mascotCloud.style.cursor = "pointer";
        mascotCloud.addEventListener("click", toggleChat);
    }
});

