// 岩画之灵 - 主脚本

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 导航栏高亮
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '/' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        }
    });
    
    // 统计数字动画
    animateStats();
});

// 统计数字动画
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(num => {
        const target = parseInt(num.textContent);
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            num.textContent = Math.floor(current);
        }, 30);
    });
}

// 返回顶部按钮
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 打印功能
function printPage() {
    window.print();
}
