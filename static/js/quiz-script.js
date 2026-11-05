// 岩画之灵 - 知识测试脚本

document.getElementById('submit-btn').addEventListener('click', async () => {
    const answers = {};
    let answered = 0;
    
    // 收集所有答案
    document.querySelectorAll('.quiz-question').forEach((q) => {
        const qid = q.dataset.id;
        const selected = q.querySelector(`input[name="q${qid}"]:checked`);
        if (selected) {
            answers[qid] = selected.value;
            answered++;
        }
    });
    
    if (answered === 0) {
        alert('请至少回答一题');
        return;
    }
    
    // 提交答案
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ 评分中...';
    
    try {
        const response = await fetch('/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });
        
        const data = await response.json();
        
        // 显示结果
        showResults(data);
    } catch (error) {
        console.error('提交失败:', error);
        alert('提交失败，请稍后重试');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交答案';
    }
});

function showResults(data) {
    // 隐藏表单
    document.getElementById('quiz-form').style.display = 'none';
    
    // 显示结果
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.style.display = 'block';
    
    // 更新分数
    document.getElementById('score-text').textContent = data.score;
    document.getElementById('score-percentage').textContent = `${Math.round(data.percentage)}%`;
    
    // 评论
    const comment = getComment(data.percentage);
    document.getElementById('score-comment').textContent = comment;
    
    // 显示详情
    const detailsDiv = document.getElementById('result-details');
    let detailsHTML = '<h3>📋 详细结果</h3>';
    
    data.results.forEach((r) => {
        const icon = r.is_correct ? '✅' : '❌';
        const className = r.is_correct ? 'correct' : 'incorrect';
        detailsHTML += `
            <div class="result-item ${className}">
                <strong>${icon} ${r.question}</strong><br>
                <small>你的答案：${r.user_answer}</small><br>
                <small>正确答案：${r.correct_answer}</small><br>
                <small>解析：${r.explanation}</small>
            </div>
        `;
    });
    
    detailsDiv.innerHTML = detailsHTML;
    
    // 滚动到结果
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function getComment(percentage) {
    if (percentage >= 90) return '🎉 太厉害了！你是岩画专家！';
    if (percentage >= 80) return '👏 非常棒！你对贺兰山岩画了解很深！';
    if (percentage >= 70) return '😊 不错哦！继续加油！';
    if (percentage >= 60) return '🤔 还不错，再多了解一些吧！';
    if (percentage >= 50) return '📚 继续学习，你会更了解岩画的！';
    return '💪 没关系，多看看岩画图谱，下次一定更好！';
}
