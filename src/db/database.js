import Dexie from 'dexie';

const db = new Dexie('LinguaVaultDB');

db.version(1).stores({
  words: '++id, language, text, pronunciation, definition, partOfSpeech, example, notes, createdAt',
  reviews: '++id, wordId, nextReviewDate, intervalDays, repetitions, easeFactor, lastReviewDate, lastQuality',
  notes: '++id, language, title, content, tags, createdAt'
});

// 导出数据库实例，方便各处使用
export default db;