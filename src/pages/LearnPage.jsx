import { useState, useEffect } from 'react';
import db from '../db/database';
import { calculateNextReview } from '../utils/srs';

function LearnPage() {
  const [queue, setQueue] = useState([]);       // 待学习的单词数组
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [known, setKnown] = useState(null);     // 用户选择：true=认识, false=不认识
  const [loading, setLoading] = useState(true);

  // 初始化待学队列：优先复习到期单词，其次新单词
  useEffect(() => {
    const buildQueue = async () => {
      const allWords = await db.words.toArray();
      const allReviews = await db.reviews.toArray();

      const reviewMap = new Map(allReviews.map(r => [r.wordId, r]));

      // 分离：有复习记录的按下次复习时间排序，新单词直接放后面
      const dueWords = [];
      const newWords = [];

      for (const word of allWords) {
        const review = reviewMap.get(word.id);
        if (review) {
          dueWords.push({ word, review });
        } else {
          newWords.push({ word, review: null });
        }
      }

      // 到期单词排在前面
      dueWords.sort((a, b) => {
        const dateA = a.review ? new Date(a.review.nextReviewDate) : new Date(0);
        const dateB = b.review ? new Date(b.review.nextReviewDate) : new Date(0);
        return dateA - dateB;
      });

      // 新单词随机打乱
      newWords.sort(() => Math.random() - 0.5);

      const combined = [...dueWords, ...newWords];
      setQueue(combined);
      setLoading(false);
    };

    buildQueue();
  }, []);

  const currentItem = queue[currentIndex];
  const currentWord = currentItem?.word;
  const currentReview = currentItem?.review;

  // 用户点击“认识”或“不认识”
  const handleKnow = async (isKnown) => {
    setKnown(isKnown);
    setShowMeaning(true);

    // 更新复习记录
    if (currentWord) {
      if (currentReview) {
        // 已有复习记录，更新它
        const updated = calculateNextReview(currentReview, isKnown ? 4 : 1);
        await db.reviews.update(currentReview.id, updated);
      } else {
        // 新单词，创建复习记录
        const newReview = {
          wordId: currentWord.id,
          nextReviewDate: new Date(),
          intervalDays: 0,
          repetitions: 0,
          easeFactor: 2.5,
          lastReviewDate: null,
          lastQuality: null
        };
        const updated = calculateNextReview(newReview, isKnown ? 4 : 1);
        await db.reviews.add(updated);
      }
    }
  };

  // 下一个单词
  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
      setKnown(null);
    } else {
      // 全部学完
      setCurrentIndex(queue.length); // 触发完成状态
    }
  };

  // 重新开始（重新随机抽取新单词）
  const handleRestart = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setShowMeaning(false);
    setKnown(null);
    const allWords = await db.words.toArray();
    // 简单随机打乱全部单词（适合小范围刷词）
    const shuffled = allWords.sort(() => Math.random() - 0.5).map(w => ({ word: w, review: null }));
    setQueue(shuffled);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f8fafc', color: '#475569', fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  // 全部学完
  if (currentIndex >= queue.length) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
        padding: '20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#1e293b' }}>🎉 已完成本轮学习</h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '16px' }}>
          你已学习完队列中的所有单词
        </p>
        <button
          onClick={handleRestart}
          style={{
            padding: '12px 28px',
            fontSize: '16px',
            fontWeight: '600',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}
        >
          重新开始新一组
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>
      {/* 进度条 */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>
          <span>第 {currentIndex + 1} / {queue.length} 个</span>
          <span>{Math.round(((currentIndex + 1) / queue.length) * 100)}%</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${((currentIndex + 1) / queue.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
            borderRadius: '2px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* 主单词卡片 */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '48px 32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '280px',
        transition: 'all 0.3s ease',
      }}>
        {/* 英文单词 */}
        <div style={{
          fontSize: '40px',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '24px',
          textAlign: 'center',
          lineHeight: '1.2',
          letterSpacing: '-0.5px',
        }}>
          {currentWord?.text}
        </div>

        {/* 音标 */}
        {currentWord?.pronunciation && (
          <div style={{
            fontSize: '16px',
            color: '#94a3b8',
            marginBottom: '16px',
            fontStyle: 'italic',
          }}>
            {currentWord.pronunciation}
          </div>
        )}

        {/* 释义（点击认识/不认识后显示） */}
        {showMeaning && (
          <div style={{
            background: '#f0f9ff',
            borderRadius: '12px',
            padding: '16px 20px',
            marginTop: '8px',
            width: '100%',
            textAlign: 'left',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
              {currentWord?.definition}
            </div>
            {currentWord?.example && (
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                📖 {currentWord.example}
              </div>
            )}
            {known === true && (
              <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '500' }}>
                ✓ 已标记为“认识”
              </div>
            )}
            {known === false && (
              <div style={{ marginTop: '8px', color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
                ✗ 已标记为“不认识”
              </div>
            )}
          </div>
        )}
      </div>

      {/* 操作按钮区域 */}
      <div style={{
        marginTop: '32px',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {!showMeaning ? (
          <>
            <button
              onClick={() => handleKnow(true)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '17px',
                fontWeight: '600',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
                transition: 'all 0.2s',
              }}
            >
              我认识
            </button>
            <button
              onClick={() => handleKnow(false)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '17px',
                fontWeight: '600',
                background: '#fff',
                color: '#64748b',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
              }}
            >
              不认识
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '17px',
              fontWeight: '600',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(15,23,42,0.3)',
            }}
          >
            {currentIndex < queue.length - 1 ? '下一个单词' : '完成学习'}
          </button>
        )}
      </div>

      {/* 收藏/笔记提示（可选） */}
      {currentWord?.notes && showMeaning && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: '#fefce8',
          borderRadius: '12px',
          color: '#854d0e',
          fontSize: '13px',
          maxWidth: '420px',
          width: '100%',
        }}>
          📝 笔记：{currentWord.notes}
        </div>
      )}
    </div>
  );
}

export default LearnPage;