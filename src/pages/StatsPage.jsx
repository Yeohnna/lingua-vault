import { useState, useEffect } from 'react';
import db from '../db/database';

function StatsPage() {
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    todayReviews: 0,
    totalReviews: 0
  });
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('reminderTime') || '');
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem('reminderEnabled') === 'true');

  useEffect(() => {
    loadStats();
    if (reminderEnabled && reminderTime) {
      Notification.requestPermission();
      const now = new Date();
      const [h, m] = reminderTime.split(':');
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);
      const timeout = target - now;
      const timer = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('学习提醒', { body: '该复习啦！' });
        }
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [reminderEnabled, reminderTime]);

  const loadStats = async () => {
    const words = await db.words.toArray();
    const reviews = await db.reviews.toArray();
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayReviews = reviews.filter(r => r.lastReviewDate && new Date(r.lastReviewDate) >= todayStart).length;
    const mastered = reviews.filter(r => r.intervalDays >= 21).length;
    setStats({
      totalWords: words.length,
      masteredWords: mastered,
      todayReviews,
      totalReviews: reviews.length
    });
  };

  const exportData = async () => {
    const words = await db.words.toArray();
    const reviews = await db.reviews.toArray();
    const notes = await db.notes.toArray();
    const grammar = await db.grammar.toArray();
    const grammarReviews = await db.grammarReviews.toArray();
    const writing = await db.writing.toArray();
    const json = JSON.stringify({ words, reviews, notes, grammar, grammarReviews, writing }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-vault-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.words) await db.words.bulkPut(data.words);
        if (data.reviews) await db.reviews.bulkPut(data.reviews);
        if (data.notes) await db.notes.bulkPut(data.notes);
        if (data.grammar) await db.grammar.bulkPut(data.grammar);
        if (data.grammarReviews) await db.grammarReviews.bulkPut(data.grammarReviews);
        if (data.writing) await db.writing.bulkPut(data.writing);
        alert('导入成功！');
        loadStats();
      } catch (err) {
        alert('文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  const toggleReminder = (e) => {
    const checked = e.target.checked;
    setReminderEnabled(checked);
    localStorage.setItem('reminderEnabled', checked);
    if (checked && reminderTime) {
      Notification.requestPermission();
    }
  };

  const updateReminderTime = (e) => {
    setReminderTime(e.target.value);
    localStorage.setItem('reminderTime', e.target.value);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>学习统计</h2>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>总单词数</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalWords}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>掌握单词</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.masteredWords}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>今日复习</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.todayReviews}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>复习总次数</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalReviews}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <h3>数据备份</h3>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button onClick={exportData}>导出备份</button>
          <label style={{ background: 'var(--accent)', color: 'var(--button-text)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            导入备份
            <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <h3>每日提醒</h3>
        <label>
          <input type="checkbox" checked={reminderEnabled} onChange={toggleReminder} style={{ width: 'auto', marginRight: '8px' }} />
          开启提醒
        </label>
        <div style={{ marginTop: '8px' }}>
          <input type="time" value={reminderTime} onChange={updateReminderTime} style={{ width: 'auto' }} />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>设置提醒时间（需允许通知权限）</p>
      </div>
    </div>
  );
}

export default StatsPage;