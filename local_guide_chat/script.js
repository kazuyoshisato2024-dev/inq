// Mock Data for Local Guides
const guides = [
    {
        id: 1,
        name: "Kenji Tanaka",
        specialty: "Hidden Bars & Izakaya",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
        greeting: "Hi! I know the best hidden bars in Tokyo. Want to grab a drink?"
    },
    {
        id: 2,
        name: "Sarah Miller",
        specialty: "History & Culture",
        rating: 4.8,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
        greeting: "Hello! Interested in the deep history of this area? Let me guide you."
    },
    {
        id: 3,
        name: "Yuki Sato",
        specialty: "Street Food",
        rating: 5.0,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
        greeting: "Hungry? I can show you the best street food spots that locals love!"
    },
    {
        id: 4,
        name: "David Chen",
        specialty: "Photography Spots",
        rating: 4.7,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
        greeting: "Looking for the perfect shot? I know all the photogenic angles here."
    }
];

// State
let currentChatGuide = null;
let map = null;
let userMarker = null;

// DOM Elements
const guideListEl = document.getElementById('guide-list');
const chatInterface = document.getElementById('chat-interface');
const closeChatBtn = document.getElementById('close-chat-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const feedbackBtn = document.getElementById('feedback-btn');
const chatGuideName = document.getElementById('chat-guide-name');
const chatGuideAvatar = document.getElementById('chat-guide-avatar');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const locationText = document.getElementById('current-location-text');

// Initialize App
function init() {
    initMap();
    renderGuides();
    setupEventListeners();
}

// Map Initialization
function initMap() {
    // Default to Tokyo Station if geolocation fails
    const defaultLat = 35.681236; // Tokyo Station latitude
    const defaultLng = 139.767125; // Tokyo Station longitude
    // Set initial location text to Tokyo Station
    locationText.textContent = "東京駅";

    map = L.map('map', {
        zoomControl: false // Hide default zoom controls for cleaner UI
    }).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Get User Location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateUserLocation(latitude, longitude);
                locationText.textContent = "現在地周辺";
            },
            (error) => {
                console.error("Geolocation error:", error);
                locationText.textContent = "位置情報を取得できませんでした";
            }
        );
    } else {
        locationText.textContent = "Geolocation not supported";
    }
}

function updateUserLocation(lat, lng) {
    map.setView([lat, lng], 15);

    // Custom pulse icon for user
    const pulseIcon = L.divIcon({
        className: 'user-marker-pulse',
        html: '<div class="pulse-ring"></div><div class="user-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
    }
}

// Render Guide List
function renderGuides() {
    guideListEl.innerHTML = guides.map(guide => `
        <div class="guide-card" onclick="openChat(${guide.id})">
            <img src="${guide.avatar}" alt="${guide.name}" class="guide-avatar">
            <div class="guide-info">
                <div class="guide-name">${guide.name}</div>
                <div class="guide-specialty">${guide.specialty}</div>
                <div class="guide-rating">
                    <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span>${guide.rating}</span>
                </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
    `).join('');
}

// Chat Logic
window.openChat = function (guideId) {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    currentChatGuide = guide;
    chatGuideName.textContent = guide.name;
    chatGuideAvatar.src = guide.avatar;

    // Reset messages
    chatMessages.innerHTML = `
        <div class="message system">
            <p>${guide.name} との会話が始まりました</p>
        </div>
        <div class="message received">
            <p>${guide.greeting}</p>
        </div>
    `;

    chatInterface.classList.add('active');
};

function closeChat() {
    chatInterface.classList.remove('active');
    currentChatGuide = null;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'sent');
    messageInput.value = '';

    // Simulate response
    setTimeout(() => {
        const responses = [
            "That sounds great! Tell me more.",
            "I can definitely help with that.",
            "Let's meet at the station in 10 minutes?",
            "I know a perfect place for that!",
            "Sure thing!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'received');
    }, 1500);
}

function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msgDiv);
}

// Event Listeners
function setupEventListeners() {
    closeChatBtn.addEventListener('click', closeChat);

    if (videoCallBtn) {
        videoCallBtn.addEventListener('click', () => {
            window.open('https://meet.google.com/new', '_blank');
        });
    }

    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            if (currentChatGuide) {
                window.location.href = `feedback.html?guide=${currentChatGuide.id}`;
            }
        });
    }

    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Add custom CSS for the user marker pulse
const style = document.createElement('style');
style.textContent = `
    .user-marker-pulse {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .user-dot {
        width: 12px;
        height: 12px;
        background-color: #4F46E5;
        border-radius: 50%;
        border: 2px solid white;
        z-index: 2;
    }
    .pulse-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(79, 70, 229, 0.4);
        border-radius: 50%;
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Run
init();
