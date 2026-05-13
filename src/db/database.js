import Dexie from 'dexie';

const db = new Dexie('LinguaVaultDB');

db.version(2).stores({
  words: '++id, language, text, pronunciation, definition, partOfSpeech, example, notes, createdAt',
  reviews: '++id, wordId, nextReviewDate, intervalDays, repetitions, easeFactor, lastReviewDate, lastQuality',
  notes: '++id, language, title, content, tags, createdAt',
  // 新增语法表
  grammar: '++id, language, title, content, example, rule, tags, createdAt',
  // 语法复习表，复用 reviews 结构，但用 grammarId 关联
  grammarReviews: '++id, grammarId, nextReviewDate, intervalDays, repetitions, easeFactor, lastReviewDate, lastQuality'
});

export default db;