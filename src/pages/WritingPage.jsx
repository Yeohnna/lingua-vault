import { useState, useEffect } from 'react';
import db from '../db/database';

function WritingPage() {
  const [writings, setWritings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterLang, setFilterLang] = useState('all');
  const [form, setForm] = useState({
    title: '', content: '', feedback: '', tags: '', language: 'english'
  });

  const loadWritings = async () => {
    let collection = db.writing;
    if (filterLang !== 'all') {
      collection = collection.where('language').equals(filterLang);
    }
    const all = await collection.reverse().toArray();
    setWritings(all);
  };

  useEffect(() => { loadWritings(); }, [filterLang]);

  const resetForm = () => {
    setForm({ title: '', content: '', feedback: '', tags: '', language: 'english' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      language: form.language,
      title: form.title,
      content: form.content,
      feedback: form.feedback || '',
      tags: form.tags || '',
      createdAt: new Date()
    };
    if (editId) {
      await db.writing.update(editId, data);
    } else {
      await db.writing.add(data);
    }
    resetForm();
    loadWritings();
  };

  const handleEdit = (writing) => {
    setForm({
      title: writing.title,
      content: writing.content,
      feedback: writing.feedback || '',
      tags: writing.tags || '',
      language: writing.language
    });
    setEditId(writing.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('删除这篇写作？')) {
      await db.writing.delete(id);
      loadWritings();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>✍️ 写作角</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '关闭' : '＋ 新写作'}
        </button>
      </div>

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

      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <select value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
            <option value="english">英语</option>
            <option value="korean">韩语</option>
            <option value="other">其他</option>
          </select>
          <input type="text" placeholder="标题（可选，如：日记 5/13）" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          <textarea placeholder="在这里写下你的句子或段落..." value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows="5" required />
          <textarea placeholder="自我点评/笔记（可选）" value={form.feedback} onChange={(e) => setForm({...form, feedback: e.target.value})} rows="2" />
          <input type="text" placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} />
          <button type="submit" style={{ width: '100%', marginTop: '8px' }}>{editId ? '更新写作' : '保存写作'}</button>
        </form>
      )}

      {writings.length === 0 ? (
        <p className="empty-state">还没有写作练习，点击右上角开始写句子吧</p>
      ) : (
        writings.map((w) => (
          <div key={w.id} className="card" style={{ position: 'relative' }}>
            {w.title && <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{w.title}</div>}
            <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{w.content}</div>
            {w.feedback && <div style={{ marginTop: '8px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>📝 点评：{w.feedback}</div>}
            {w.tags && <div style={{ marginTop: '8px', color: 'var(--muted)' }}>🏷️ {w.tags}</div>}
            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', background: '#facc15', color: '#000' }} onClick={() => handleEdit(w)}>✏️</button>
              <button style={{ padding: '4px 8px', background: '#ef4444' }} onClick={() => handleDelete(w.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default WritingPage;