// 岩画之灵 - 用户调查脚本

document.getElementById('survey-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 收集表单数据
    const formData = new FormData(e.target);
    const data = {
        age: formData.get('age'),
        occupation: formData.get('occupation'),
        knowledge: formData.get('knowledge'),
        display: formData.get('display'),
        features: [],
        suggestion: formData.get('suggestion') || ''
    };
    
    // 收集多选
    document.querySelectorAll('input[name="features"]:checked').forEach((el) => {
        data.features.push(el.value);
    });
    
    // 提交
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ 提交中...';
    
    try {
        const response = await fetch('/api/submit-survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 显示结果
            document.getElementById('survey-form').style.display = 'none';
            document.getElementById('survey-result').style.display = 'block';
            
            document.getElementById('survey-message').textContent = result.message;
            
            // 显示推荐
            const recsDiv = document.getElementById('recommendations');
            let recsHTML = '<h3>🎯 为您推荐：</h3><ul>';
            result.recommendations.forEach((rec) => {
                recsHTML += `<li>${rec}</li>`;
            });
            recsHTML += '</ul>';
            recsDiv.innerHTML = recsHTML;
            
            // 滚动到结果
            document.getElementById('survey-result').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('提交失败:', error);
        alert('提交失败，请稍后重试');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交调查';
    }
});
