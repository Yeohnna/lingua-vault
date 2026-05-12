import { useState, useEffect, useCallback } from 'react';
import db from '../db/database';
import { calculateNextReview, getDueReviews } from '../utils/srs';

function ReviewPage() {
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState('card'); // 'card' or 'fill'
  const [fillInput, setFillInput] = useState('');
  const [fillResult, setFillResult] = useState(null);

  // 触摸滑动相关
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const loadDueCards = async () => {
    const cards = await getDueReviews(db);
    const cardsWithWord = await Promise.all(cards.map(async (card) => {
      const word = await db.words.get(card.wordId);
      return { ...card, word };
    }));
    setDueCards(cardsWithWord.filter(c => c.word));
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  useEffect(() => { loadDueCards(); }, []);

  const handleRate = async (quality) => {
    if (!dueCards.length) return;
    const card = dueCards[currentIndex];
    const updated = calculateNextReview(card, quality);
    await db.reviews.update(card.id, updated);
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex + 1 < dueCards.length) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setFillInput('');
      setFillResult(null);
    } else {
      setDueCards([]);
    }
  };

  const initReviewForWords = async () => {
    const allWords = await db.words.toArray();
    const allReviewWordIds = (await db.reviews.toArray()).map(r => r.wordId);
    for (const word of allWords) {
      if (!allReviewWordIds.includes(word.id)) {
        await db.reviews.add({
          wordId: word.id,
          nextReviewDate: new Date(),
          intervalDays: 0,
          repetitions: 0,
          easeFactor: 2.5,
          lastReviewDate: null,
          lastQuality: null
        });
      }
    }
    loadDueCards();
  };

  // 填空模式：从例句中挖掉单词
  const getFillQuestion = () => {
    if (!dueCards.length) return null;
    const card = dueCards[currentIndex];
    const word = card.word;
    if (!word.example) return null;
    const regex = new RegExp(word.text, 'gi');
    const masked = word.example.replace(regex, '____');
    return { masked, answer: word.text };
  };

  const checkFillAnswer = () => {
    const question = getFillQuestion();
    if (!question) return;
    if (fillInput.trim().toLowerCase() === question.answer.toLowerCase()) {
      setFillResult('correct');
      handleRate(5); // 自动评为简单
    } else {
      setFillResult('wrong');
      handleRate(0); // 忘记
    }
  };

  // 触摸滑动处理
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleRate(0); // 左滑：忘记
    } else if (isRightSwipe) {
      handleRate(5); // 右滑：简单
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (dueCards.length === 0) {
    return (
      <div style={{ padding: '16px' }}>
        <h2>今日复习</h2>
        <p style={{ marginTop: '20px', color: 'var(--muted)' }}>没有需要复习的单词 🎉</p>
        <button onClick={initReviewForWords} style={{ marginTop: '12px' }}>初始化新单词到复习队列</button>
        
        {/* 模式切换 */}
        <div style={{ marginTop: '30px' }}>
          <label>复习模式：</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="card">卡片模式</option>
            <option value="fill">填空模式</option>
          </select>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const fillQuestion = mode === 'fill' ? getFillQuestion() : null;

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>今日复习 ({currentIndex + 1}/{dueCards.length})</h2>
        <select value={mode} onChange={(e) => { setMode(e.target.value); setShowAnswer(false); }}>
          <option value="card">卡片</option>
          <option value="fill">填空</option>
        </select>
      </div>

      {mode === 'card' && (
        <div
          className="card"
          style={{ marginTop: '20px', textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>{currentCard.word.text}</div>
          {showAnswer ? (
            <div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>{currentCard.word.definition}</div>
              {currentCard.word.pronunciation && <div style={{ color: 'var(--muted)' }}>{currentCard.word.pronunciation}</div>}
              {currentCard.word.example && <div style={{ marginTop: '8px', fontSize: '14px' }}>例句: {currentCard.word.example}</div>}
              {currentCard.word.notes && <div style={{ marginTop: '4px', fontSize: '13px' }}>📝 {currentCard.word.notes}</div>}
            </div>
          ) : (
            <button onClick={() => setShowAnswer(true)}>显示释义</button>
          )}
        </div>
      )}

      {mode === 'fill' && fillQuestion && (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>{fillQuestion.masked}</div>
          <input
            type="text"
            placeholder="输入单词"
            value={fillInput}
            onChange={(e) => setFillInput(e.target.value)}
            style={{ width: '80%' }}
          />
          <button onClick={checkFillAnswer} style={{ marginTop: '12px', width: '80%' }}>检查</button>
          {fillResult && (
            <div style={{ marginTop: '12px', color: fillResult === 'correct' ? '#16a34a' : '#dc2626' }}>
              {fillResult === 'correct' ? '✅ 正确！' : `❌ 错误，答案是 "${fillQuestion.answer}"`}
            </div>
          )}
        </div>
      )}
      {mode === 'fill' && !fillQuestion && (
        <p style={{ marginTop: '20px', color: 'var(--muted)' }}>这个单词没有例句，请切换到卡片模式。</p>
      )}

      {/* 评级按钮（卡片模式） */}
      {mode === 'card' && showAnswer && (
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', gap: '8px' }}>
          {[
            { label: '忘记', quality: 0, color: '#dc2626' },
            { label: '困难', quality: 2, color: '#ea580c' },
            { label: '一般', quality: 3, color: '#ca8a04' },
            { label: '简单', quality: 5, color: '#16a34a' },
          ].map((btn) => (
            <button key={btn.label} onClick={() => handleRate(btn.quality)} style={{ background: btn.color, flex: 1 }}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', textAlign: 'center' }}>
        提示：卡片上左滑忘记，右滑简单
      </p>
    </div>
  );
}

export default ReviewPage;