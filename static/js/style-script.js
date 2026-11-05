// 岩画之灵 - 风格迁移脚本

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const transferBtn = document.getElementById('transfer-btn');
const styleResult = document.getElementById('style-result');

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
        transferBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// 风格迁移按钮
transferBtn.addEventListener('click', async () => {
    if (!uploadedImage) return;
    
    transferBtn.disabled = true;
    transferBtn.textContent = '⏳ 转换中...';
    
    try {
        const response = await fetch('/api/style-transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: uploadedImage })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 显示结果
            document.getElementById('original-img').src = uploadedImage;
            document.getElementById('styled-img').src = data.result_url;
            styleResult.style.display = 'block';
            
            // 设置下载链接
            document.getElementById('download-link').href = data.result_url;
            
            // 滚动到结果
            styleResult.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('风格迁移失败:', error);
        alert('风格迁移失败，请稍后重试');
    } finally {
        transferBtn.disabled = false;
        transferBtn.textContent = '✨ 转换为岩画风格';
    }
});
