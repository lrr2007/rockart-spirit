#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
岩画之灵 - AI驱动的贺兰山岩画数字活化平台
Flask Web 应用主程序
"""

import json
import random
import math
from datetime import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# 加载数据
with open('rockart_data.json', 'r', encoding='utf-8') as f:
    rockarts = json.load(f)

with open('quiz_data.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

# 获取唯一分类
all_types = sorted(set(r['type'] for r in rockarts if r['type']))
all_locations = sorted(set(r['location'] for r in rockarts if r['location']))

# 获取每日一画（按日期选择，每天固定一幅）
def get_daily_rockart():
    today = datetime.now()
    day_of_year = today.timetuple().tm_yday
    return rockarts[day_of_year % len(rockarts)]

# 首页
@app.route('/')
def index():
    daily = get_daily_rockart()
    # 获取6幅推荐岩画
    recommended = random.sample(rockarts, min(6, len(rockarts)))
    return render_template('index.html', 
                          daily=daily, 
                          recommended=recommended,
                          total=len(rockarts),
                          datetime=datetime)

# 岩画图谱 - 浏览、搜索、分类
@app.route('/gallery')
def gallery():
    # 获取筛选参数
    search_query = request.args.get('q', '').lower()
    filter_type = request.args.get('type', '')
    filter_location = request.args.get('location', '')
    filter_era = request.args.get('era', '')
    page = int(request.args.get('page', 1))
    per_page = 12
    
    # 筛选
    filtered = rockarts.copy()
    
    if search_query:
        filtered = [r for r in filtered if search_query in r['name'].lower() or search_query in r['interpretation'].lower()]
    
    if filter_type:
        filtered = [r for r in filtered if filter_type in r['type']]
    
    if filter_location:
        filtered = [r for r in filtered if filter_location in r['location']]
    
    if filter_era:
        filtered = [r for r in filtered if filter_era in r['era']]
    
    # 分页
    total_pages = math.ceil(len(filtered) / per_page)
    start = (page - 1) * per_page
    paginated = filtered[start:start + per_page]
    
    return render_template('gallery.html',
                          rockarts=paginated,
                          total=len(filtered),
                          page=page,
                          total_pages=total_pages,
                          all_types=all_types,
                          all_locations=all_locations,
                          search_query=search_query,
                          filter_type=filter_type,
                          filter_location=filter_location,
                          filter_era=filter_era)

# 岩画详情页
@app.route('/detail/<rockart_id>')
def detail(rockart_id):
    rockart = next((r for r in rockarts if r['id'] == rockart_id), None)
    if not rockart:
        return "岩画未找到", 404
    
    # 相关岩画（同类型）
    related = [r for r in rockarts if r['type'] == rockart['type'] and r['id'] != rockart_id][:4]
    
    return render_template('detail.html', rockart=rockart, related=related)

# AI 解读页面
@app.route('/ai')
def ai():
    return render_template('ai.html')

# AI 解读 API（模拟 AI 分析）
@app.route('/api/ai-interpret', methods=['POST'])
def ai_interpret():
    data = request.json
    image_url = data.get('image_url', '')
    
    # 模拟 AI 分析（实际项目接入 MaaS 大模型）
    # 这里用随机岩画作为"分析结果"
    result = random.choice(rockarts)
    
    return jsonify({
        'success': True,
        'analysis': {
            'pattern_type': result['type'],
            'era_estimate': result['era'],
            'cultural_meaning': result['purpose'],
            'story': f"这幅{result['name']}创作于{result['era']}，发现于{result['location']}。"
                    f"{result['interpretation'][:200]}...",
            'confidence': random.randint(75, 92)
        }
    })

# 风格迁移 API（模拟）
@app.route('/api/style-transfer', methods=['POST'])
def style_transfer():
    data = request.json
    image_url = data.get('image_url', '')
    
    # 模拟风格迁移结果
    # 实际项目接入 MaaS 图像生成 API
    return jsonify({
        'success': True,
        'result_url': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        'style': '贺兰山岩画风格',
        'prompt': '将图片转换为贺兰山岩画风格，粗犷线条，赭红色调'
    })

# AI 问答 API（模拟）
@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    data = request.json
    question = data.get('question', '')
    
    # 从知识库中检索相关岩画
    relevant = [r for r in rockarts if any(kw in question for kw in r['name'] + r['type'] + r['purpose'])]
    
    if relevant:
        answer = f'关于「{relevant[0]["name"]}」，{relevant[0]["purpose"]}。'
        if len(relevant) > 1:
            answer += f" 此外，还有{relevant[0]['name']}等岩画也具有类似特征。"
    else:
        answer = "这个问题很有意思！贺兰山岩画是距今约1万年至3000年间的文化遗产，包含人面像、动物、狩猎等多种图案。"
        answer += " 如果您有更具体的问题，比如关于某类岩画的含义，欢迎告诉我！"
    
    return jsonify({
        'success': True,
        'answer': answer,
        'source': relevant[0]['name'] if relevant else None
    })

# 知识测试页面
@app.route('/quiz')
def quiz():
    # 随机选10道题
    selected = random.sample(quizzes, min(10, len(quizzes)))
    return render_template('quiz.html', quizzes=selected)

# 提交测试答案
@app.route('/api/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.json
    answers = data.get('answers', {})
    
    score = 0
    results = []
    
    for qid, user_answer in answers.items():
        quiz = next((q for q in quizzes if q['id'] == qid), None)
        if quiz:
            is_correct = user_answer == quiz['answer']
            if is_correct:
                score += 1
            results.append({
                'id': qid,
                'question': quiz['question'],
                'user_answer': user_answer,
                'correct_answer': quiz['answer'],
                'is_correct': is_correct,
                'explanation': quiz['explanation']
            })
    
    total = len(results)
    percentage = (score / total * 100) if total > 0 else 0
    
    return jsonify({
        'success': True,
        'score': score,
        'total': total,
        'percentage': percentage,
        'results': results
    })

# 风格迁移页面
@app.route('/style')
def style():
    return render_template('style.html')

# 统计信息 API
@app.route('/api/stats')
def stats():
    return jsonify({
        'total_rockarts': len(rockarts),
        'total_types': len(all_types),
        'total_locations': len(all_locations),
        'total_quizzes': len(quizzes),
        'daily': get_daily_rockart()['name']
    })


# 用户调查页面
@app.route('/survey')
def survey():
    return render_template('survey.html')

# 提交调查
@app.route('/api/submit-survey', methods=['POST'])
def submit_survey():
    data = request.json
    
    # 构建用户画像
    profile = {
        'age': data.get('age', ''),
        'occupation': data.get('occupation', ''),
        'knowledge': data.get('knowledge', ''),
        'display': data.get('display', ''),
        'features': data.get('features', []),
        'suggestion': data.get('suggestion', ''),
        'timestamp': datetime.now().isoformat()
    }
    
    # 保存到调查文件
    import os
    import json
    
    survey_file = 'survey_results.json'
    results = []
    
    if os.path.exists(survey_file):
        with open(survey_file, 'r', encoding='utf-8') as f:
            results = json.load(f)
    
    results.append(profile)
    
    with open(survey_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 根据画像生成推荐
    recommendations = generate_recommendations(profile)
    
    return jsonify({
        'success': True,
        'message': '感谢您的反馈！我们将根据您的偏好优化网站内容。',
        'recommendations': recommendations
    })

def generate_recommendations(profile):
    """根据用户画像生成个性化推荐"""
    recs = []
    
    # 根据职业推荐
    occ = profile.get('occupation', '')
    if occ == 'student':
        recs.append('📚 推荐您尝试「知识测试」功能，检验学习成果')
        recs.append('🎓 我们准备了适合学生的岩画科普内容')
    elif occ == 'teacher':
        recs.append('🏫 推荐您查看「岩画图谱」，可用于教学素材')
        recs.append('📝 知识测试功能可用于课堂互动')
    elif occ == 'researcher':
        recs.append('🔬 推荐您使用「AI 深度解读」功能')
        recs.append('📖 我们整理了详细的岩画学术资料')
    elif occ == 'tourism':
        recs.append('🗺️ 推荐您查看贺兰山岩画景区导览信息')
        recs.append('📸 风格迁移功能可用于旅游宣传素材')
    elif occ == 'art':
        recs.append('🎨 推荐您尝试「风格迁移」功能')
        recs.append('🖼️ 岩画图案可用于艺术创作参考')
    
    # 根据知识水平推荐
    knowledge = profile.get('knowledge', '')
    if knowledge == 'beginner':
        recs.append('🌟 建议从「每日一画」开始了解岩画')
        recs.append('📖 推荐阅读首页的岩画背景介绍')
    elif knowledge == 'basic':
        recs.append('📝 「知识测试」可以帮助您系统学习')
    elif knowledge == 'expert':
        recs.append('🔍 「AI 解读」功能可深入分析岩画细节')
    
    # 根据展示偏好推荐
    display = profile.get('display', '')
    if display == 'story':
        recs.append('📖 我们为每幅岩画准备了生动的故事化解读')
    elif display == 'interactive':
        recs.append('🎮 推荐您尝试「风格迁移」和「知识测试」')
    elif display == 'academic':
        recs.append('📚 详情页包含学术引用和古籍互证')
    
    # 根据感兴趣的功能推荐
    features = profile.get('features', [])
    if 'ai_interpret' in features:
        recs.append('🤖 点击「AI 解读」体验岩画智能分析')
    if 'style_transfer' in features:
        recs.append('🎨 点击「风格迁移」将照片转为岩画风格')
    if 'quiz' in features:
        recs.append('📝 点击「知识测试」挑战 100 道岩画知识题')
    
    # 默认推荐
    if len(recs) <= 2:
        recs.append('🏔️ 欢迎探索「岩画图谱」浏览全部藏品')
        recs.append('📅 每日一画更新，欢迎每天来访')
    
    return recs

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
