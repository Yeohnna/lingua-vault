import { useState, useEffect } from 'react';
import db from '../db/database';

function GamePage() {
  const [bubbles, setBubbles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [message, setMessage] = useState('');

  // 随机抽取单词，生成泡泡并打乱
  const initGame = async () => {
    const allWords = await db.words
      .filter(w => w.definition && w.definition.trim() !== '')
      .toArray();

    if (allWords.length === 0) {
      setMessage('词库中没有带释义的单词，请先在单词本中添加一些单词并填写释义。');
      setBubbles([]);
      return;
    }

    // 随机抽取最多10个
    const count = Math.min(10, allWords.length);
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, count);

    // 生成泡泡
    const generated = [];
    shuffled.forEach((word) => {
      generated.push({
        id: `text-${word.id}`,
        wordId: word.id,
        type: 'text',
        content: word.text,
        color: 'dark',   // 深蓝色
      });
      generated.push({
        id: `def-${word.id}`,
        wordId: word.id,
        type: 'definition',
        content: word.definition,
        color: 'light',  // 浅蓝色
      });
    });

    // 随机打乱
    for (let i = generated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generated[i], generated[j]] = [generated[j], generated[i]];
    }

    setBubbles(generated);
    setSelected(null);
    setMatched(new Set());
    setMessage('');
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleBubbleClick = (bubble) => {
    // 已经消除的泡泡不可点击
    if (matched.has(bubble.wordId)) return;

    if (!selected) {
      setSelected(bubble);
    } else {
      // 点击同一个泡泡
      if (selected.id === bubble.id) {
        setSelected(null);
        return;
      }

      // 检查是否同一单词且类型不同
      if (selected.wordId === bubble.wordId && selected.type !== bubble.type) {
        // 正确配对，消除
        const newMatched = new Set(matched);
        newMatched.add(bubble.wordId);
        setMatched(newMatched);
        setSelected(null);

        // 检查是否全部消除
        if (newMatched.size === bubbles.length / 2) {
          setMessage('🎉 全部消除！点击“重新开始”再来一局。');
        }
      } else {
        // 配对失败，清除选中
        setSelected(null);
      }
    }
  };

  if (message && bubbles.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🎮 单词消消乐</h2>
        <p style={{ marginTop: '40px' }}>{message}</p>
        <button onClick={initGame} style={{ marginTop: '20px' }}>
          重新开始
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', background: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center' }}>🎮 单词消消乐</h2>
      <p style={{ textAlign: 'center', color: '#666' }}>
        点击英文单词泡泡，再点击对应的中文释义泡泡，配对正确即可消除
      </p>

      {/* 泡泡网格 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '20px',
          maxWidth: '600px',
          margin: '20px auto',
        }}
      >
        {bubbles.map((bubble) => {
          const isSelected = selected?.id === bubble.id;
          const isMatched = matched.has(bubble.wordId);

          // 颜色定义
          const darkColor = '#1e3a8a';   // 深蓝
          const lightColor = '#93c5fd';  // 浅蓝

          return (
            <div
              key={bubble.id}
              onClick={() => handleBubbleClick(bubble)}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: bubble.type === 'text' ? '14px' : '12px',
                color: bubble.color === 'dark' ? '#ffffff' : '#1e3a8a',
                background: bubble.color === 'dark'
                  ? `radial-gradient(circle at 30% 30%, #3b82f6, ${darkColor})`
                  : `radial-gradient(circle at 30% 30%, #bfdbfe, ${lightColor})`,
                boxShadow: isSelected
                  ? '0 0 0 4px #fbbf24, 0 8px 20px rgba(0,0,0,0.2)'
                  : '0 6px 14px rgba(0,0,0,0.15), inset 0 -4px 6px rgba(0,0,0,0.1), inset 0 4px 6px rgba(255,255,255,0.4)',
                cursor: isMatched ? 'default' : 'pointer',
                opacity: isMatched ? 0 : 1,
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                wordBreak: 'break-word',
                padding: '4px',
                lineHeight: '1.2',
              }}
            >
              {bubble.content}
            </div>
          );
        })}
      </div>

      {message && (
        <p style={{ textAlign: 'center', marginTop: '16px', color: '#2563eb' }}>
          {message}
        </p>
      )}

      {/* 底部重新开始按钮 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        <button
          onClick={initGame}
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#1e40af',
            color: '#fff',
          }}
        >
          🔄 重新开始
        </button>
      </div>
    </div>
  );
}

export default GamePage;