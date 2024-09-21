'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './InteractiveDisplay.module.css';
import config from '../config.json';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import midAutumnConfig from '../themes/Mid-Autumn/config.json';

// 如果您需要使用 Options 类型，可以这样声明：
type Html2CanvasOptions = Parameters<typeof html2canvas>[1];

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
      setThemeConfig(themeConfig.default || themeConfig);
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
        backgroundColor: themeConfig?.backgroundColor || 'black',
        logging: true,
        ignoreElements: (element) => element.classList.contains(styles.inputArea)
      } as Html2CanvasOptions);

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

  const theme = midAutumnConfig;

  const getFontFamily = (text: string) => {
    return /^[\u4e00-\u9fa5]+$/.test(text) ? 
      theme.fontFamily.chinese : 
      theme.fontFamily.english;
  };

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
          {currentTheme === 'Lighton' && themeConfig.lightEffect && (
            <>
              <div 
                className={styles.lightBar} 
                style={{
                  position: 'absolute',
                  top: `calc(50% + ${themeConfig.lightEffect.position.y}px)`,
                  left: `calc(50% - ${parseInt(themeConfig.lightEffect.width) / 2}px)`,
                  width: themeConfig.lightEffect.width,
                  height: themeConfig.lightEffect.height,
                  backgroundColor: themeConfig.lightEffect.color,
                  boxShadow: `0 0 ${themeConfig.lightEffect.blur} ${themeConfig.lightEffect.color}`,
                  opacity: themeConfig.lightEffect.intensity,
                  zIndex: 2,
                }}
              />
              <div 
                className={styles.lightBeam} 
                style={{
                  position: 'absolute',
                  top: `calc(50% + ${themeConfig.lightEffect.position.y}px + ${themeConfig.lightEffect.height})`,
                  left: `calc(50% - ${parseInt(themeConfig.lightEffect.width) / 2}px)`,
                  width: themeConfig.lightEffect.width,
                  height: themeConfig.lightEffect.beamLength,
                  background: `linear-gradient(to bottom, ${themeConfig.lightEffect.color}, transparent)`,
                  opacity: themeConfig.lightEffect.intensity * 0.5,
                  clipPath: `polygon(0 0, 100% 0, ${100 + themeConfig.lightEffect.beamSpread / 2}% 100%, ${-themeConfig.lightEffect.beamSpread / 2}% 100%)`,
                  zIndex: 2,
                }}
              />
            </>
          )}
          {currentTheme === 'Porsche' && themeConfig.porscheEffect && themeConfig.porscheEffect.enabled && (
            <div 
              className={styles.porscheStripe}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: themeConfig.porscheEffect.stripeWidth,
                backgroundColor: themeConfig.porscheEffect.stripeColor,
                zIndex: 2,
              }}
            />
          )}
          {currentTheme === 'Mid-Autumn' && themeConfig.midAutumnEffect && themeConfig.midAutumnEffect.enabled && (
            <div 
              className={styles.midAutumnEffect}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${themeConfig.midAutumnEffect.lanternImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right bottom',
                opacity: themeConfig.midAutumnEffect.lanternOpacity,
                zIndex: 1,
              }}
            />
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.clockContainer}>
            <div 
              className={styles.clock} 
              style={{
                ...themeConfig.clockStyle,
                marginTop: currentTheme === 'Mid-Autumn' ? themeConfig.clockStyle.marginTop : undefined
              }}
            >
              {currentTime}
            </div>
            {currentTheme === 'Porsche' && themeConfig.underlineStyle && (
              <div 
                className={styles.underline}
                style={{
                  backgroundColor: themeConfig.underlineStyle.color,
                  height: themeConfig.underlineStyle.height,
                  width: `calc(${themeConfig.clockStyle.fontSize} * ${themeConfig.underlineStyle.widthMultiplier} * 5)`, // 5 是时间字符的大致数量
                  margin: '0 auto',
                  marginTop: '10px' // 调整此值以改变线条与时间的距离
                }}
              />
            )}
          </div>
          <div className={styles.textLayer}>
            <div className={styles.displayArea}>
              <p 
                className={styles.englishText} 
                style={{
                  ...themeConfig.englishTextStyle,
                  fontFamily: getFontFamily(displayText.en)
                }}
              >
                {displayText.en}
              </p>
              <p 
                className={styles.chineseText} 
                style={{
                  ...themeConfig.textStyle,
                  fontFamily: getFontFamily(displayText.zh)
                }}
              >
                {displayText.zh}
              </p>
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

export default InteractiveDisplay;// 添加这个新的组件来显示时钟图标
const ClockIcon: React.FC<{ time: string }> = ({ time }) => {
  const [hours, minutes] = time.split(':').map(Number);
  const hourDegrees = (hours % 12 + minutes / 60) * 30;
  const minuteDegrees = minutes * 6;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="23" stroke="white" strokeWidth="2" fill="none" />
      <line x1="24" y1="24" x2="24" y2="12" stroke="white" strokeWidth="2" transform={`rotate(${hourDegrees} 24 24)`} />
      <line x1="24" y1="24" x2="24" y2="8" stroke="white" strokeWidth="1" transform={`rotate(${minuteDegrees} 24 24)`} />
    </svg>
  );
};

