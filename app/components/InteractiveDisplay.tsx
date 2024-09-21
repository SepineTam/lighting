'use client';

import React, { useState, useEffect } from 'react';
import styles from './InteractiveDisplay.module.css';
import config from '../config.json';

const InteractiveDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [inputTextEn, setInputTextEn] = useState<string>('');
  const [inputTextZh, setInputTextZh] = useState<string>('');
  const [texts, setTexts] = useState<Array<{ en: string; zh: string }>>(config.texts);
  const [displayText, setDisplayText] = useState<{ en: string; zh: string }>(config.texts[0]);
  const [textIndex, setTextIndex] = useState<number>(0);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);

    // 从localStorage加载保存的文本
    const savedTexts = localStorage.getItem('savedTexts');
    if (savedTexts) {
      setTexts(JSON.parse(savedTexts));
    }

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = () => {
    const newText = { en: inputTextEn.trim(), zh: inputTextZh.trim() };
    if (newText.en && newText.zh) {
      const updatedTexts = [...texts, newText];
      setTexts(updatedTexts);
      setDisplayText(newText);
      setInputTextEn('');
      setInputTextZh('');

      // 保存到localStorage
      localStorage.setItem('savedTexts', JSON.stringify(updatedTexts));
    }
  };

  const handleNextText = () => {
    const nextIndex = (textIndex + 1) % texts.length;
    setTextIndex(nextIndex);
    setDisplayText(texts[nextIndex]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.clock}>{currentTime}</div>
      <div className={styles.lightBeam}>
        <div className={styles.displayArea}>
          <p className={styles.englishText}>{displayText.en}</p>
          <p className={styles.chineseText}>{displayText.zh}</p>
        </div>
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={inputTextEn}
          onChange={(e) => setInputTextEn(e.target.value)}
          placeholder="输入英文文本"
          className={styles.input}
        />
        <input
          type="text"
          value={inputTextZh}
          onChange={(e) => setInputTextZh(e.target.value)}
          placeholder="输入中文文本"
          className={styles.input}
        />
        <button onClick={handleSubmit} className={styles.button}>提交</button>
        <button onClick={handleNextText} className={styles.button}>下一条</button>
        <button className={styles.button}>下载图片</button>
      </div>
    </div>
  );
};

export default InteractiveDisplay;