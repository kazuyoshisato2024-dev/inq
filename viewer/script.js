// ===== State Management =====
let currentMode = 'extract'; // 'extract' or 'iframe'

// ===== DOM Elements =====
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const loadBtn = document.getElementById('load-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const contentDisplay = document.getElementById('content-display');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessage = errorEl.querySelector('.error-message');

// ===== Event Listeners =====
loadBtn.addEventListener('click', handleLoadContent);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLoadContent();
    }
});

selectorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLoadContent();
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    });
});

// ===== Main Functions =====
async function handleLoadContent() {
    const url = urlInput.value.trim();

    if (!url) {
        showError('URLを入力してください');
        return;
    }

    if (!isValidUrl(url)) {
        showError('有効なURLを入力してください');
        return;
    }

    showLoading();

    try {
        if (currentMode === 'extract') {
            await loadExtractedContent(url);
        } else {
            await loadIframeContent(url);
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showError(`コンテンツの読み込みに失敗しました: ${error.message}`);
    }
}

async function loadExtractedContent(url) {
    // List of CORS proxies to try
    const proxies = [
        {
            name: 'corsproxy.io',
            url: (targetUrl) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
            extractContent: (response) => response.text()
        },
        {
            name: 'allorigins.win',
            url: (targetUrl) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
            extractContent: async (response) => {
                const data = await response.json();
                return data.contents;
            }
        }
    ];

    let lastError = null;

    // Try each proxy in order
    for (const proxy of proxies) {
        try {
            const proxyUrl = proxy.url(url);
            console.log(`🔄 Trying ${proxy.name}:`, proxyUrl);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            const response = await fetch(proxyUrl, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const htmlContent = await proxy.extractContent(response);
            console.log(`📦 Received HTML from ${proxy.name}, length:`, htmlContent ? htmlContent.length : 0);

            if (!htmlContent) {
                throw new Error('プロキシからHTMLコンテンツを取得できませんでした');
            }

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            console.log('📄 Parsed document body:', doc.body ? 'exists' : 'missing');

            // Get custom selector from input
            const customSelector = selectorInput.value.trim();
            let content = null;
            let usedSelector = '';

            // Try custom selector first
            if (customSelector) {
                try {
                    content = doc.querySelector(customSelector);
                    if (content) {
                        usedSelector = customSelector;
                        console.log(`✅ Found content with custom selector: ${customSelector}`);
                    } else {
                        console.log(`❌ Custom selector not found: ${customSelector}`);
                    }
                } catch (e) {
                    console.warn(`⚠️ Invalid selector: ${customSelector}`, e);
                }
            }

            // Fallback: try other common article selectors
            if (!content) {
                const fallbackSelectors = [
                    '.sys-article_contents',
                    '.article--main--cell.content',
                    'article',
                    '.article',
                    '.content',
                    'main',
                    '.post-content',
                    '.entry-content',
                    '#content',
                    '.post-body'
                ];

                console.log('🔍 Trying fallback selectors...');
                for (const selector of fallbackSelectors) {
                    content = doc.querySelector(selector);
                    if (content) {
                        usedSelector = selector;
                        console.log(`✅ Found content with fallback selector: ${selector}`);
                        break;
                    } else {
                        console.log(`❌ Selector not found: ${selector}`);
                    }
                }
            }

            // Debug: show available elements
            if (!content) {
                console.log('🔍 Available body children:', doc.body ? doc.body.children.length : 0);
                if (doc.body && doc.body.children.length > 0) {
                    const elements = Array.from(doc.body.children).slice(0, 10).map(el => {
                        const tag = el.tagName.toLowerCase();
                        const cls = el.className ? '.' + el.className.split(' ').join('.') : '';
                        const id = el.id ? '#' + el.id : '';
                        return tag + id + cls;
                    });
                    console.log('📋 First 10 elements:', elements);
                }
                throw new Error('指定されたコンテンツが見つかりませんでした。コンソールログを確認して適切なセレクタを入力してください。');
            }

            console.log(`✅ Content found using ${proxy.name}! Length:`, content.innerHTML.length);

            // Display the extracted content
            displayExtractedContent(content.innerHTML, url, usedSelector);
            return; // Success! Exit the function

        } catch (error) {
            console.warn(`⚠️ ${proxy.name} failed:`, error.message);
            lastError = error;
            // Continue to next proxy
        }
    }

    // All proxies failed
    console.error('❌ All CORS proxies failed');
    throw new Error(lastError?.message || '全てのプロキシで読み込みに失敗しました。埋め込みモードをお試しください。');
}

async function loadIframeContent(url) {
    return new Promise((resolve, reject) => {
        // Clear content display first
        contentDisplay.innerHTML = '';

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'content-iframe';
        iframe.src = url;
        iframe.title = 'Embedded Content';
        iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';

        // Add iframe to DOM immediately (while loading is still visible)
        contentDisplay.appendChild(iframe);

        // Set a timeout for loading
        const timeout = setTimeout(() => {
            hideLoading();
            contentDisplay.classList.remove('hidden');
            console.log('⏱️ Iframe timeout - displaying anyway');
            resolve();
        }, 10000); // 10 seconds timeout

        iframe.onload = () => {
            clearTimeout(timeout);
            hideLoading();
            contentDisplay.classList.remove('hidden');
            console.log('✅ Iframe loaded successfully');
            resolve();
        };

        iframe.onerror = (e) => {
            clearTimeout(timeout);
            console.error('❌ Iframe error:', e);
            reject(new Error('iframeの読み込みに失敗しました。このサイトは埋め込みを許可していない可能性があります。'));
        };
    });
}

function displayExtractedContent(html, sourceUrl, selector) {
    hideLoading();

    const wrapper = document.createElement('div');
    wrapper.className = 'extracted-content';

    // Add source link and selector info
    const sourceLink = document.createElement('div');
    sourceLink.style.marginBottom = '2rem';
    sourceLink.style.padding = '1rem';
    sourceLink.style.background = 'rgba(255, 255, 255, 0.05)';
    sourceLink.style.borderRadius = '8px';
    sourceLink.innerHTML = `
        <p style="margin: 0 0 0.5rem 0; color: var(--text-secondary);">
            <strong>元記事:</strong> 
            <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #4facfe;">
                ${sourceUrl}
            </a>
        </p>
        ${selector ? `<p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">
            <strong>使用セレクタ:</strong> <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${selector}</code>
        </p>` : ''}
    `;

    wrapper.appendChild(sourceLink);

    // Add the extracted content
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = html;
    wrapper.appendChild(contentDiv);

    contentDisplay.innerHTML = '';
    contentDisplay.appendChild(wrapper);
    contentDisplay.classList.remove('hidden');
}

// ===== UI State Functions =====
function showLoading() {
    contentDisplay.classList.add('hidden');
    errorEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    contentDisplay.classList.add('hidden');
    errorMessage.textContent = message;
    errorEl.classList.remove('hidden');
}

// ===== Utility Functions =====
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// ===== Initialize =====
console.log('🚀 Content Viewer initialized');
console.log('📍 Current mode:', currentMode);
