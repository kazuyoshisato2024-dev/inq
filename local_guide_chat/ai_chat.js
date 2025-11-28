const messagesContainer = document.getElementById('ai-messages');
const inputField = document.getElementById('ai-input');
const sendBtn = document.getElementById('ai-send-btn');
const goToMapBtn = document.getElementById('go-to-map-btn');

// AI Responses Logic
const aiResponses = [
    "それは素敵ですね！地元のガイドなら、観光客が知らない穴場を知っているかもしれません。",
    "いいですね！そのエリアなら、歴史に詳しいガイドや、グルメなガイドがおすすめです。",
    "なるほど。リラックスしたいなら、少し中心部から離れた場所がいいかもしれませんね。",
    "承知しました。では、あなたの好みに合いそうなガイドを探してみましょう！"
];

function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // User Message
    addMessage(text, 'sent');
    inputField.value = '';

    // AI Response (Simulated)
    setTimeout(() => {
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        addMessage(randomResponse, 'received');
    }, 1000);
}

function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

goToMapBtn.addEventListener('click', () => {
    // Navigate to the consultation form page
    window.location.href = 'consultation_form.html';
});
