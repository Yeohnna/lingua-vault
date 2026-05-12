function WordsPage() {
  // 示例单词列表（后续会从 IndexedDB 读取）
  const words = [
    { id: 1, text: 'apple', pronunciation: '/ˈæp.əl/', meaning: '苹果' },
    { id: 2, text: 'book', pronunciation: '/bʊk/', meaning: '书' },
    { id: 3, text: 'cat', pronunciation: '/kæt/', meaning: '猫' },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <h2>我的单词本</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {words.map((word) => (
          <li
            key={word.id}
            style={{
              background: '#f5f5f5',
              marginBottom: '12px',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '18px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{word.text}</div>
            <div style={{ color: '#666' }}>{word.pronunciation}</div>
            <div>{word.meaning}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WordsPage;