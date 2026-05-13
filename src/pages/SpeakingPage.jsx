import { useState, useRef } from 'react';

function SpeakingPage() {
  const [text, setText] = useState('');
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [availableVoices, setAvailableVoices] = useState([]);

  // 录音相关
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // 加载可用语音
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    setAvailableVoices(voices);
    if (!voices.find(v => v.lang === voiceLang)) {
      // 自动选一个与该语言匹配的
      const matched = voices.filter(v => v.lang.startsWith(voiceLang.split('-')[0]));
      if (matched.length) setVoiceLang(matched[0].lang);
    }
  };
  speechSynthesis.onvoiceschanged = loadVoices;

  // 朗读
  const speak = () => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = availableVoices.find(v => v.lang === voiceLang);
    if (voice) utterance.voice = voice;
    utterance.lang = voiceLang;
    speechSynthesis.speak(utterance);
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert('无法访问麦克风：' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>🗣️ 口语练习</h2>

      <div className="card">
        <h3>文本转语音</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入任意英文或韩文单词/句子..."
          rows="3"
        />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
          <select value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)}>
            {availableVoices.map((v, i) => (
              <option key={i} value={v.lang}>{v.name} ({v.lang})</option>
            ))}
          </select>
          <button onClick={speak}>🔊 朗读</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <h3>录音对比</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          点击开始录音，朗读上面的文本，然后停止，即可听到自己的发音进行对比。
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {recording ? (
            <button onClick={stopRecording} style={{ background: '#ef4444' }}>⏹️ 停止录音</button>
          ) : (
            <button onClick={startRecording}>🎙️ 开始录音</button>
          )}
        </div>
        {recordedAudio && (
          <div style={{ marginTop: '12px' }}>
            <p>你的录音：</p>
            <audio controls src={recordedAudio} style={{ width: '100%' }}></audio>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpeakingPage;