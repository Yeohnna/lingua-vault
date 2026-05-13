import { useState, useEffect } from 'react';
import db from '../db/database';
import { calculateNextReview } from '../utils/srs';

function GrammarPage() {
  const [grammars, setGrammars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterLang, setFilterLang] = useState('all');
  const [form, setForm] = useState({
    title: '', content: '', example: '', rule: '', tags: '', language: 'english'
  });

  const loadGrammars = async () => {
    let collection = db.grammar;
    if (filterLang !== 'all') {
      collection = collection.where('language').equals(filterLang);
    }
    const all = await collection.reverse().toArray();
    setGrammars(all);
  };

  useEffect(() => { loadGrammars(); }, [filterLang]);

  const resetForm = () => {
    setForm({ title: '', content: '', example: '', rule: '', tags: '', language: 'english' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      language: form.language,
      title: form.title,
      content: form.content,
      example: form.example || '',
      rule: form.rule || '',
      tags: form.tags || '',
      createdAt: new Date()
    };
    if (editId) {
      await db.grammar.update(editId, data);
    } else {
      await db.grammar.add(data);
      // 自动创建复习卡片
      await db.grammarReviews.add({
        grammarId: (await db.grammar.orderBy('id').last()).id, // 简单取 id，实际可用返回值
        nextReviewDate: new Date(),
        intervalDays: 0,
        repetitions: 0,
        easeFactor: 2.5,
        lastReviewDate: null,
        lastQuality: null
      });
    }
    resetForm();
    loadGrammars();
  };

  const handleEdit = (grammar) => {
    setForm({
      title: grammar.title,
      content: grammar.content,
      example: grammar.example || '',
      rule: grammar.rule || '',
      tags: grammar.tags || '',
      language: grammar.language
    });
    setEditId(grammar.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('删除这个语法点吗？')) {
      await db.grammar.delete(id);
      await db.grammarReviews.where('grammarId').equals(id).delete();
      loadGrammars();
    }
  };

  // 简单复习弹窗（也可以做成内嵌卡片）
  const startReview = async (grammar) => {
    const review = await db.grammarReviews.where('grammarId').equals(grammar.id).first();
    if (!review) {
      alert('该语法点还未加入复习队列，点击保存时会自动创建。');
      return;
    }
    const quality = prompt('请给复习评分（0=完全忘记, 5=完全掌握）', '5');
    if (quality === null) return;
    const q = parseInt(quality, 10);
    if (isNaN(q) || q < 0 || q > 5) {
      alert('请输入 0-5 的数字');
      return;
    }
    const updated = calculateNextReview(review, q);
    await db.grammarReviews.update(review.id, updated);
    alert('复习记录已更新！');
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>语法宝典</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '关闭' : '＋ 添加'}
        </button>
      </div>

      {/* 语言筛选 */}
      <select
        value={filterLang}
        onChange={(e) => setFilterLang(e.target.value)}
        style={{ width: 'auto', margin: '8px 0 16px' }}
      >
        <option value="all">全部语言</option>
        <option value="english">英语</option>
        <option value="korean">韩语</option>
        <option value="other">其他</option>
      </select>

      {/* 表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <select value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
            <option value="english">英语</option>
            <option value="korean">韩语</option>
            <option value="other">其他</option>
          </select>
          <input type="text" placeholder="标题（如：虚拟语气）" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          <textarea placeholder="语法说明" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows="3" required />
          <input type="text" placeholder="例句" value={form.example} onChange={(e) => setForm({...form, example: e.target.value})} />
          <input type="text" placeholder="规则公式（如：If + past perfect, would have + V3）" value={form.rule} onChange={(e) => setForm({...form, rule: e.target.value})} />
          <input type="text" placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} />
          <button type="submit" style={{ width: '100%', marginTop: '8px' }}>{editId ? '更新语法' : '保存语法'}</button>
        </form>
      )}

      {/* 列表 */}
      {grammars.length === 0 ? (
        <p className="empty-state">暂无语法点，点击右上角添加第一个吧</p>
      ) : (
        grammars.map((grammar) => (
          <div key={grammar.id} className="card" style={{ position: 'relative' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{grammar.title}</div>
            <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{grammar.content}</div>
            {grammar.rule && <div style={{ marginTop: '8px', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>📐 {grammar.rule}</div>}
            {grammar.example && <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>📖 {grammar.example}</div>}
            {grammar.tags && <div style={{ marginTop: '8px', color: 'var(--muted)' }}>🏷️ {grammar.tags}</div>}
            {/* 操作按钮 */}
            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', background: '#8b5cf6' }} onClick={() => startReview(grammar)}>🔄</button>
              <button style={{ padding: '4px 8px', background: '#facc15', color: '#000' }} onClick={() => handleEdit(grammar)}>✏️</button>
              <button style={{ padding: '4px 8px', background: '#ef4444' }} onClick={() => handleDelete(grammar.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default GrammarPage;