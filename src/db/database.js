import Dexie from 'dexie';

const db = new Dexie('LinguaVaultDB');

db.version(3).stores({
  words: '++id, language, text, pronunciation, definition, partOfSpeech, example, notes, createdAt',
  reviews: '++id, wordId, nextReviewDate, intervalDays, repetitions, easeFactor, lastReviewDate, lastQuality',
  notes: '++id, language, title, content, tags, createdAt',
  grammar: '++id, language, title, content, example, rule, tags, createdAt',
  grammarReviews: '++id, grammarId, nextReviewDate, intervalDays, repetitions, easeFactor, lastReviewDate, lastQuality',
  // 新增写作练习表
  writing: '++id, language, title, content, feedback, tags, createdAt'
});

export default db;