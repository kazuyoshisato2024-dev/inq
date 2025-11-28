// Sample consultation data
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

// Render consultation cards
function renderConsultations(filteredConsultations) {
    const grid = document.getElementById('consultation-grid');

    if (filteredConsultations.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">該当する相談がありません</p>';
        return;
    }

    grid.innerHTML = filteredConsultations.map(consultation => `
        <div class="consultation-card" onclick="viewDetail('${consultation.id}')">
            <div class="card-header">
                <span class="card-id">${consultation.id}</span>
                <span class="status-badge ${getStatusClass(consultation.status)}">
                    ${getStatusText(consultation.status)}
                </span>
            </div>
            
            <div class="card-info">
                <div class="info-row">
                    <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span class="info-label">希望日時:</span>
                    <span class="info-value">${formatDateTime(consultation.datetime)}</span>
                </div>
                
                <div class="info-row">
                    <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span class="info-label">言語:</span>
                    <span class="info-value">${consultation.language}</span>
                </div>
                
                <div class="info-row">
                    <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    <span class="info-label">交通機関:</span>
                    <span class="info-value">${consultation.transport}</span>
                </div>
            </div>
            
            <div class="card-content">
                ${consultation.content}
            </div>
            
            <div class="card-footer">
                <button class="btn btn-primary" onclick="event.stopPropagation(); viewDetail('${consultation.id}')">
                    詳細を見る
                    <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Filter consultations
function filterConsultations() {
    const languageFilter = document.getElementById('language-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    let filtered = consultations;

    if (languageFilter !== 'all') {
        filtered = filtered.filter(c => c.language === languageFilter);
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(c => c.status === statusFilter);
    }

    renderConsultations(filtered);
}

// View detail page
function viewDetail(id) {
    // Save consultation ID to sessionStorage
    sessionStorage.setItem('selectedConsultationId', id);
    // Navigate to detail page
    window.location.href = 'detail.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Render all consultations initially
    renderConsultations(consultations);

    // Add event listeners to filters
    document.getElementById('language-filter').addEventListener('change', filterConsultations);
    document.getElementById('status-filter').addEventListener('change', filterConsultations);
});

// Export for use in detail page
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { consultations };
}
