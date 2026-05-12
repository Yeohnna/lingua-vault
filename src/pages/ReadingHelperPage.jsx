import { useState } from 'react';
import db from '../db/database';

function ReadingHelperPage() {
  const [text, setText] = useState('');
  const [knownWords, setKnownWords] = useState([]);
  const [unknownMap, setUnknownMap] = useState({});

  const analyzeText = async () => {
    const words = await db.words.toArray();
    const wordSet = new Set(words.map(w => w.text.toLowerCase()));
    const tokens = text.split(/\s+/);
    const known = [];
    const unknown = {};
    tokens.forEach((token) => {
      const clean = token.replace(/[.,!?;:'"()]/g, '');
      if (clean && wordSet.has(clean.toLowerCase())) {
        known.push(clean);
      } else if (clean) {
        unknown[clean] = true;
      }
    });
    setKnownWords([...new Set(known)]);
    setUnknownMap(unknown);
  };

  const addToWords = async (word) => {
    // 快速添加
    await db.words.add({
      language: 'english',
      text: word,
      pronunciation: '',
      definition: '',
      partOfSpeech: '',
      example: '',
      notes: '',
      createdAt: new Date()
    });
    setUnknownMap(prev => {
      const next = { ...prev };
      delete next[word];
      return next;
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>阅读助手</h2>
      <textarea
        rows="6"
        placeholder="在此粘贴一篇英文或韩文文章..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', marginBottom: '12px' }}
      />
      <button onClick={analyzeText} style={{ width: '100%', marginBottom: '16px' }}>分析文章</button>

      {knownWords.length > 0 && (
        <div className="card">
          <h3>已学单词 ({knownWords.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {knownWords.map(w => (
              <span key={w} style={{ background: '#16a34a', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>{w}</span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(unknownMap).length > 0 && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>生词 ({Object.keys(unknownMap).length})</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.keys(unknownMap).map(word => (
              <li key={word} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{word}</span>
                <button onClick={() => addToWords(word)} style={{ padding: '4px 12px', fontSize: '14px', background: '#3b82f6' }}>加入词库</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {text && !knownWords.length && !Object.keys(unknownMap).length && (
        <p style={{ color: 'var(--muted)' }}>请输入文章，然后点击分析</p>
      )}
    </div>
  );
}

export default ReadingHelperPage;