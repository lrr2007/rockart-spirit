// 岩画之灵 - AI 页面脚本

// 上传图片处理
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const analyzeBtn = document.getElementById('analyze-btn');

let uploadedImage = null;

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = 'rgba(139, 69, 19, 0.05)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border)';
    uploadArea.style.background = 'white';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border)';
    uploadArea.style.background = 'white';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;
        previewImage.src = uploadedImage;
        previewImage.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// AI 解读按钮
analyzeBtn.addEventListener('click', async () => {
    if (!uploadedImage) return;
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ 分析中...';
    
    try {
        const response = await fetch('/api/ai-interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: uploadedImage })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const resultDiv = document.getElementById('ai-result');
            const contentDiv = document.getElementById('result-content');
            
            contentDiv.innerHTML = `
                <div class="result-item">
                    <strong>🎯 图案类型：</strong>${data.analysis.pattern_type}
                </div>
                <div class="result-item">
                    <strong>📅 年代推测：</strong>${data.analysis.era_estimate}
                </div>
                <div class="result-item">
                    <strong>💡 文化含义：</strong>${data.analysis.cultural_meaning}
                </div>
                <div class="result-item">
                    <strong>📖 故事解读：</strong>${data.analysis.story}
                </div>
                <div class="result-item">
                    <strong>📊 置信度：</strong>${data.analysis.confidence}%
                </div>
            `;
            
            resultDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('AI 分析失败:', error);
        alert('AI 分析失败，请稍后重试');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '✨ 开始 AI 解读';
    }
});

// 聊天功能
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // 添加用户消息
    addMessage('user', message);
    chatInput.value = '';
    
    // 发送请求
    try {
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessage('bot', data.answer);
        }
    } catch (error) {
        console.error('聊天失败:', error);
        addMessage('bot', '抱歉，我遇到了一些问题，请稍后再试。');
    }
}

function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-avatar">👤</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🏔️</div>
            <div class="message-content">${text}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
