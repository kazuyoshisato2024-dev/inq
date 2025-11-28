// Get consultation data from app.js
const consultations = [
    {
        id: 'INQ-001',
        datetime: '2025-11-28T14:00',
        language: '北京語',
        transport: 'タクシー',
        content: '京都駅から清水寺までの行き方を教えてください。タクシーで行きたいのですが、料金の目安と所要時間を知りたいです。',
        status: 'new',
        userName: '張 明',
        submittedAt: '2025-11-28T10:15'
    },
    {
        id: 'INQ-002',
        datetime: '2025-11-28T16:30',
        language: '韓国語',
        transport: 'バス',
        content: '大阪城周辺でおすすめのランチスポットを教えてください。予算は一人3000円程度です。',
        status: 'new',
        userName: '김 수진',
        submittedAt: '2025-11-28T09:45'
    },
    {
        id: 'INQ-003',
        datetime: '2025-11-29T10:00',
        language: '英語',
        transport: '電車',
        content: 'I want to visit Mount Fuji from Tokyo. What is the best way to get there by train? Also, are there any guided tours available?',
        status: 'in-progress',
        userName: 'John Smith',
        submittedAt: '2025-11-27T18:30'
    },
    {
        id: 'INQ-004',
        datetime: '2025-11-28T13:00',
        language: '広東語',
        transport: 'バス',
        content: '想去奈良看鹿，請問從大阪怎麼去最方便？需要買什麼票？',
        status: 'new',
        userName: '陳 小明',
        submittedAt: '2025-11-28T11:20'
    },
    {
        id: 'INQ-005',
        datetime: '2025-11-30T15:00',
        language: '北京語',
        transport: '電車',
        content: '我想去箱根泡温泉，请推荐一些性价比高的温泉旅馆。最好能看到富士山的。',
        status: 'new',
        userName: '王 芳',
        submittedAt: '2025-11-28T08:00'
    },
    {
        id: 'INQ-006',
        datetime: '2025-11-27T11:00',
        language: '韓国語',
        transport: 'タクシー',
        content: '도쿄 디즈니랜드에 가려고 하는데, 호텔에서 택시로 가면 얼마나 걸리나요? 아침 일찍 가고 싶어요.',
        status: 'completed',
        userName: '박 지훈',
        submittedAt: '2025-11-26T14:00'
    },
    {
        id: 'INQ-007',
        datetime: '2025-11-29T18:00',
        language: '英語',
        transport: '電車',
        content: 'Looking for authentic ramen restaurants in Shibuya area. I prefer tonkotsu style. Any recommendations?',
        status: 'new',
        userName: 'Sarah Johnson',
        submittedAt: '2025-11-28T12:30'
    },
    {
        id: 'INQ-008',
        datetime: '2025-11-28T20:00',
        language: '北京語',
        transport: 'バス',
        content: '晚上想去看东京塔的夜景，请问附近有什么好吃的餐厅吗？希望能边吃饭边看夜景。',
        status: 'in-progress',
        userName: '李 娜',
        submittedAt: '2025-11-28T10:00'
    }
];

let currentConsultation = null;
let messages = [];

// Get status badge class
function getStatusClass(status) {
    const statusMap = {
        'new': 'status-new',
        'in-progress': 'status-in-progress',
        'completed': 'status-completed'
    };
    return statusMap[status] || 'status-new';
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'new': '新規',
        'in-progress': '対応中',
        'completed': '完了'
    };
    return statusMap[status] || '新規';
}

// Format datetime
function formatDateTime(datetime) {
    const date = new Date(datetime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
}

// Format time only
function formatTime(datetime) {
    const date = new Date(datetime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Load consultation details
function loadConsultationDetails() {
    const consultationId = sessionStorage.getItem('selectedConsultationId');

    if (!consultationId) {
        window.location.href = 'index.html';
        return;
    }

    currentConsultation = consultations.find(c => c.id === consultationId);

    if (!currentConsultation) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    document.getElementById('consultation-id').textContent = currentConsultation.id;

    // Update status badge
    const statusBadge = document.getElementById('status-badge');
    statusBadge.className = `status-badge ${getStatusClass(currentConsultation.status)}`;
    statusBadge.textContent = getStatusText(currentConsultation.status);

    // Update detail fields
    document.getElementById('detail-name').textContent = currentConsultation.userName;
    document.getElementById('detail-datetime').textContent = formatDateTime(currentConsultation.datetime);
    document.getElementById('detail-language').textContent = currentConsultation.language;
    document.getElementById('detail-transport').textContent = currentConsultation.transport;
    document.getElementById('detail-content').textContent = currentConsultation.content;
    document.getElementById('detail-submitted').textContent = formatDateTime(currentConsultation.submittedAt);

    // Set status select value
    document.getElementById('status-select').value = currentConsultation.status;

    // Load sample messages
    loadSampleMessages();
}

// Load sample messages
function loadSampleMessages() {
    // Add some sample messages for demonstration
    if (currentConsultation.status === 'in-progress' || currentConsultation.status === 'completed') {
        messages = [
            {
                type: 'user',
                content: currentConsultation.content,
                time: currentConsultation.submittedAt
            },
            {
                type: 'guide',
                content: 'こんにちは！ご相談ありがとうございます。詳しくお答えさせていただきます。',
                time: new Date(new Date(currentConsultation.submittedAt).getTime() + 5 * 60000).toISOString()
            }
        ];

        if (currentConsultation.status === 'completed') {
            messages.push({
                type: 'user',
                content: 'ありがとうございました！とても参考になりました。',
                time: new Date(new Date(currentConsultation.submittedAt).getTime() + 15 * 60000).toISOString()
            });
        }
    } else {
        messages = [
            {
                type: 'user',
                content: currentConsultation.content,
                time: currentConsultation.submittedAt
            }
        ];
    }

    renderMessages();
}

// Render messages
function renderMessages() {
    const messagesContainer = document.getElementById('chat-messages');

    messagesContainer.innerHTML = messages.map(msg => `
        <div class="message message-${msg.type}">
            <div class="message-content">${msg.content}</div>
            <div class="message-time">${formatTime(msg.time)}</div>
        </div>
    `).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage(e) {
    e.preventDefault();

    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (!content) return;

    // Add message
    messages.push({
        type: 'guide',
        content: content,
        time: new Date().toISOString()
    });

    // Clear input
    input.value = '';

    // Re-render messages
    renderMessages();

    // Update status to in-progress if it was new
    if (currentConsultation.status === 'new') {
        updateStatus('in-progress');
    }
}

// Update status
function updateStatus(newStatus) {
    currentConsultation.status = newStatus;

    const statusBadge = document.getElementById('status-badge');
    statusBadge.className = `status-badge ${getStatusClass(newStatus)}`;
    statusBadge.textContent = getStatusText(newStatus);

    // Update status select
    document.getElementById('status-select').value = newStatus;
}

// Generate Google Meet link
function generateMeetLink() {
    // Use Google Meet's official new meeting URL
    const meetLink = 'https://meet.google.com/new';

    // Add system message with the link
    messages.push({
        type: 'guide',
        content: `Google Meetリンクを生成しました:\n${meetLink}\n\n新しいウィンドウでミーティングが開始されます。`,
        time: new Date().toISOString()
    });

    renderMessages();

    // Open Google Meet in a new window
    window.open(meetLink, '_blank');
}

// Change status from select
function changeStatus() {
    const newStatus = document.getElementById('status-select').value;
    updateStatus(newStatus);
}

// End consultation
function endConsultation() {
    // Navigate to summary page
    window.location.href = 'summary.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadConsultationDetails();

    // Add event listener to form
    document.getElementById('chat-form').addEventListener('submit', sendMessage);

    // Add event listener to status select
    document.getElementById('status-select').addEventListener('change', changeStatus);

    // Add event listener to Meet button
    document.getElementById('meet-btn').addEventListener('click', generateMeetLink);

    // Add event listener to End Consultation button
    document.getElementById('end-consultation-btn').addEventListener('click', endConsultation);
});
