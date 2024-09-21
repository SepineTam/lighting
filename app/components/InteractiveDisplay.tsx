'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './InteractiveDisplay.module.css';
import config from '../config.json';
import html2canvas from 'html2canvas';

// 新增：闪烁警告组件
const FlashWarning: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // 2秒后自动关闭

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.flashWarning}>
      {message}
    </div>
  );
};

const InteractiveDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [inputTextEn, setInputTextEn] = useState<string>('');
  const [inputTextZh, setInputTextZh] = useState<string>('');
  const [texts, setTexts] = useState<Array<{ en: string; zh: string }>>(config.texts);
  const [displayText, setDisplayText] = useState<{ en: string; zh: string }>(config.texts[0]);
  const [textIndex, setTextIndex] = useState<number>(0);
  const [warning, setWarning] = useState<string>(''); // 新增：警告状态

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
    if (!inputTextEn || !inputTextZh) {
      setWarning('请同时输入英文和中文文本');
      return;
    }
    
    setWarning(''); // 清除警告
    const newText = { en: inputTextEn.trim(), zh: inputTextZh.trim() };
    const updatedTexts = [...texts, newText];
    setTexts(updatedTexts);
    setDisplayText(newText);
    setInputTextEn('');
    setInputTextZh('');

    // 保存到localStorage
    localStorage.setItem('savedTexts', JSON.stringify(updatedTexts));
  };

  const handleNextText = () => {
    const nextIndex = (textIndex + 1) % texts.length;
    setTextIndex(nextIndex);
    setDisplayText(texts[nextIndex]);
  };

  const displayRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (displayRef.current) {
      const canvas = await html2canvas(displayRef.current, {
        backgroundColor: 'black' as any,
        logging: true,
        ignoreElements: (element) => element.classList.contains(styles.inputArea)
      });

      const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const link = document.createElement('a');
      link.download = 'interactive-display.png';
      link.href = image;
      link.click();
    }
  };

  return (
    <div className={styles.container}>
      {warning && <FlashWarning message={warning} onClose={() => setWarning('')} />}
      <div className={styles.displayContainer} ref={displayRef}>
        <div className={styles.background}>
          <div className={styles.lightBeam}></div>
        </div>
        <div className={styles.content}>
          <div className={styles.clock} style={{
            fontFamily: config.clock.fontFamily,
            fontSize: config.clock.fontSize
          }}>{currentTime}</div>
          <div className={styles.textLayer}>
            <div className={styles.displayArea}>
              <p className={styles.englishText}>{displayText.en}</p>
              <p className={styles.chineseText}>{displayText.zh}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.inputArea}>
        <div className={styles.inputColumn}>
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
        </div>
        <div className={styles.buttonColumn}>
          <button onClick={handleSubmit} className={styles.button}>提交</button>
          <button onClick={handleNextText} className={styles.button}>下一条</button>
        </div>
        <button onClick={handleDownload} className={`${styles.button} ${styles.downloadButton}`}>下载图片</button>
      </div>
    </div>
  );
};

export default InteractiveDisplay;