import { useState, useEffect } from 'react';
import db from '../db/database';

function WordsPage() {
  const [words, setWords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    text: '', pronunciation: '', meaning: '', language: 'english', example: '', notes: ''
  });

  const loadWords = async () => {
    const all = await db.words.reverse().toArray();
    setWords(all);
  };

  useEffect(() => { loadWords(); }, []);

  const resetForm = () => {
    setForm({ text: '', pronunciation: '', meaning: '', language: 'english', example: '', notes: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      language: form.language,
      text: form.text,
      pronunciation: form.pronunciation,
      definition: form.meaning,
      partOfSpeech: '',
      example: form.example,
      notes: form.notes,
      createdAt: new Date()
    };
    if (editId) {
      await db.words.update(editId, data);
    } else {
      await db.words.add(data);
    }
    resetForm();
    loadWords();
  };

  const handleEdit = (word) => {
    setForm({
      text: word.text,
      pronunciation: word.pronunciation || '',
      meaning: word.definition || '',
      language: word.language,
      example: word.example || '',
      notes: word.notes || ''
    });
    setEditId(word.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除这个单词吗？')) {
      await db.words.delete(id);
      await db.reviews.where('wordId').equals(id).delete();
      loadWords();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>我的单词本</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '关闭' : '＋ 添加'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <select value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
            <option value="english">英语</option>
            <option value="korean">韩语</option>
            <option value="other">其他</option>
          </select>
          <input type="text" placeholder="单词" value={form.text} onChange={(e) => setForm({...form, text: e.target.value})} required />
          <input type="text" placeholder="音标/罗马音" value={form.pronunciation} onChange={(e) => setForm({...form, pronunciation: e.target.value})} />
          <input type="text" placeholder="释义" value={form.meaning} onChange={(e) => setForm({...form, meaning: e.target.value})} required />
          <input type="text" placeholder="例句（可选）" value={form.example} onChange={(e) => setForm({...form, example: e.target.value})} />
          <textarea placeholder="笔记（可选）" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows="2" />
          <button type="submit" style={{ width: '100%', marginTop: '8px' }}>{editId ? '更新单词' : '保存单词'}</button>
        </form>
      )}

      {words.length === 0 ? (
        <p style={{ color: 'var(--muted)', marginTop: '20px' }}>还没有单词，点击右上角“＋ 添加”开始</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {words.map((word) => (
            <li key={word.id} className="card" style={{ position: 'relative' }}>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                {word.text}
                <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '12px' }}>
                  {word.language === 'english' ? '英' : word.language === 'korean' ? '韩' : '其他'}
                </span>
              </div>
              {word.pronunciation && <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{word.pronunciation}</div>}
              <div style={{ marginTop: '4px' }}>{word.definition}</div>
              {word.example && <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.8, marginTop: '4px' }}>例句: {word.example}</div>}
              {word.notes && <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>📝 {word.notes}</div>}
              <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                <button style={{ padding: '4px 8px', fontSize: '14px', background: '#facc15', color: '#000' }} onClick={() => handleEdit(word)}>✏️</button>
                <button style={{ padding: '4px 8px', fontSize: '14px', background: '#ef4444' }} onClick={() => handleDelete(word.id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WordsPage;