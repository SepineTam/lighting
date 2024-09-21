'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './InteractiveDisplay.module.css';
import config from '../config.json';
import html2canvas from 'html2canvas';

const FlashWarning: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.flashWarning}>
      {message}
    </div>
  );
};

interface InteractiveDisplayProps {
  initialTheme: string;
}

const InteractiveDisplay: React.FC<InteractiveDisplayProps> = ({ initialTheme }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [inputTextEn, setInputTextEn] = useState<string>('');
  const [inputTextZh, setInputTextZh] = useState<string>('');
  const [texts, setTexts] = useState<Array<{ en: string; zh: string }>>(config.texts);
  const [displayText, setDisplayText] = useState<{ en: string; zh: string }>(config.texts[0]);
  const [textIndex, setTextIndex] = useState<number>(0);
  const [warning, setWarning] = useState<string>('');
  const [themeConfig, setThemeConfig] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState<string>(initialTheme);

  useEffect(() => {
    const loadThemeConfig = async () => {
      const themeConfig = await import(`../themes/${currentTheme}/config.json`);
      setThemeConfig(themeConfig.default || themeConfig); // 添加 .default
    };
    loadThemeConfig();
  }, [currentTheme]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);

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
    
    setWarning('');
    const newText = { en: inputTextEn.trim(), zh: inputTextZh.trim() };
    const updatedTexts = [...texts, newText];
    setTexts(updatedTexts);
    setDisplayText(newText);
    setInputTextEn('');
    setInputTextZh('');

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
        background: themeConfig?.backgroundColor || 'black',
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

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
  };

  if (!themeConfig) {
    return <div>Loading theme...</div>;
  }

  return (
    <div className={styles.container}>
      {warning && <FlashWarning message={warning} onClose={() => setWarning('')} />}
      <div className={styles.displayContainer} ref={displayRef}>
        <div className={styles.background} style={{ backgroundColor: themeConfig.backgroundColor }}>
          {currentTheme === 'Halo' && themeConfig.haloEffect && (
            <div 
              className={styles.haloEffect} 
              style={{
                background: `radial-gradient(circle at calc(50% + ${themeConfig.haloEffect.position.x}px) calc(50% + ${themeConfig.haloEffect.position.y}px), 
                            ${themeConfig.haloEffect.color} 0%, 
                            rgba(0,0,0,0) ${themeConfig.haloEffect.size})`,
                opacity: themeConfig.haloEffect.intensity,
                filter: `blur(${themeConfig.haloEffect.blur})`,
              }}
            />
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.clock} style={themeConfig.clockStyle}>
            {currentTime}
          </div>
          <div className={styles.textLayer}>
            <div className={styles.displayArea}>
              <p className={styles.englishText} style={themeConfig.textStyle}>{displayText.en}</p>
              <p className={styles.chineseText} style={themeConfig.textStyle}>{displayText.zh}</p>
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
            placeholder="输入第一行文本"
            className={styles.input}
          />
          <input
            type="text"
            value={inputTextZh}
            onChange={(e) => setInputTextZh(e.target.value)}
            placeholder="输入第二行文本"
            className={styles.input}
          />
        </div>
        <div className={styles.buttonColumn}>
          <button onClick={handleSubmit} className={styles.button}>提交</button>
          <button onClick={handleNextText} className={styles.button}>下一条</button>
        </div>
        <button onClick={handleDownload} className={`${styles.button} ${styles.downloadButton}`}>下载图片</button>
        <div className={styles.themeSelector}>
          <select
            value={currentTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className={styles.themeSelect}
          >
            {config.themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDisplay;