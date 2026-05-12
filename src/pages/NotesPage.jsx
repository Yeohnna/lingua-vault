import { useState, useEffect } from 'react';
import db from '../db/database';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', content: '', tags: '', language: 'english'
  });

  const loadNotes = async () => {
    const all = await db.notes.reverse().toArray();
    setNotes(all);
  };

  useEffect(() => { loadNotes(); }, []);

  const resetForm = () => {
    setForm({ title: '', content: '', tags: '', language: 'english' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      language: form.language,
      title: form.title,
      content: form.content,
      tags: form.tags,
      createdAt: new Date()
    };
    if (editId) {
      await db.notes.update(editId, data);
    } else {
      await db.notes.add(data);
    }
    resetForm();
    loadNotes();
  };

  const handleEdit = (note) => {
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags || '',
      language: note.language
    });
    setEditId(note.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('删除这条笔记？')) {
      await db.notes.delete(id);
      loadNotes();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>语法笔记</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '关闭' : '＋ 新建'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <select value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
            <option value="english">英语</option>
            <option value="korean">韩语</option>
            <option value="other">其他</option>
          </select>
          <input type="text" placeholder="标题" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          <textarea placeholder="内容" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows="4" required />
          <input type="text" placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} />
          <button type="submit" style={{ width: '100%', marginTop: '8px' }}>{editId ? '更新笔记' : '保存笔记'}</button>
        </form>
      )}

      {notes.length === 0 ? (
        <p style={{ color: 'var(--muted)', marginTop: '20px' }}>暂无笔记，点击“新建”开始记录语法</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="card" style={{ position: 'relative' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{note.title}</div>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{note.content}</div>
            {note.tags && <div style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '12px' }}>标签: {note.tags}</div>}
            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', background: '#facc15', color: '#000' }} onClick={() => handleEdit(note)}>✏️</button>
              <button style={{ padding: '4px 8px', background: '#ef4444' }} onClick={() => handleDelete(note.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NotesPage;