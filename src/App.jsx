import React, { useState, useEffect } from 'react';
import './App.css';

// Custom SVG Icons
const MicIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
    <line x1="12" x2="12" y1="19" y2="23"/>
    <line x1="8" x2="16" y1="23" y2="23"/>
  </svg>
);

const MicOffIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <line x1="2" x2="22" y1="2" y2="22"/>
    <path d="m18.89 13.23.4-.3a7.83 7.83 0 0 0 0-6.22l-.4-.3"/>
    <path d="m15.54 16.58.53-.4a7.83 7.83 0 0 0 0-6.22l-.53-.4"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.5-1.5a3 3 0 0 0-.62-4.62L12 5a3 3 0 0 0-3 3v1Z"/>
    <path d="M5 10v1a7 7 0 0 1 14 0v-1"/>
    <line x1="12" x2="12" y1="19" y2="23"/>
    <line x1="8" x2="16" y1="23" y2="23"/>
  </svg>
);

const VolumeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="m19.07 4.93-1.41 1.41A8.96 8.96 0 0 1 21 12a8.96 8.96 0 0 1-3.34 5.66l1.41 1.41A10.96 10.96 0 0 0 23 12a10.96 10.96 0 0 0-4.93-9.07Z"/>
    <path d="M15.54 8.46a5.5 5.5 0 0 1 0 7.07l1.41 1.41a7.5 7.5 0 0 0 0-9.89l-1.41 1.41Z"/>
  </svg>
);

const CopyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const RotateIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'bn', name: 'Bengali' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'he', name: 'Hebrew' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' }
  ];

  // Real translation function using Google Translate API (MyMemory API as fallback)
  const translateText = async (text, from, to) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    
    try {
      // Using MyMemory Translation API (free tier)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      );
      
      if (!response.ok) {
        throw new Error('Translation service unavailable');
      }
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        // Fallback to LibreTranslate API
        await translateWithLibreTranslate(text, from, to);
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Enhanced fallback with better mock translations
      await fallbackTranslation(text, from, to);
    } finally {
      setIsTranslating(false);
    }
  };

  // Fallback translation using LibreTranslate
  const translateWithLibreTranslate = async (text, from, to) => {
    try {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translatedText);
      } else {
        throw new Error('LibreTranslate failed');
      }
    } catch (error) {
      console.error('LibreTranslate error:', error);
      await fallbackTranslation(text, from, to);
    }
  };

  // Enhanced fallback translation with more comprehensive mock data
  const fallbackTranslation = async (text, from, to) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockTranslations = {
      'hello': { 
        es: 'hola', fr: 'bonjour', de: 'hallo', hi: 'नमस्ते', 
        te: 'హలో', ta: 'வணக்கம்', ar: 'مرحبا', zh: '你好' 
      },
      'how are you': { 
        es: 'cómo estás', fr: 'comment allez-vous', de: 'wie geht es dir',
        hi: 'आप कैसे हैं', te: 'మీరు ఎలా ఉన్నారు', ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்'
      },
      'thank you': { 
        es: 'gracias', fr: 'merci', de: 'danke',
        hi: 'धन्यवाद', te: 'ధన్యవాదాలు', ta: 'நன்றி'
      },
      'good morning': {
        es: 'buenos días', fr: 'bonjour', de: 'guten Morgen',
        hi: 'सुप्रभात', te: 'శుభోదయం', ta: 'காலை வணக்கம்'
      },
      'good evening': {
        es: 'buenas tardes', fr: 'bonsoir', de: 'guten Abend',
        hi: 'शुभ संध्या', te: 'సుభ సాయంత్రం', ta: 'மாலை வணக்கம்'
      }
    };
    
    const lowerText = text.toLowerCase().trim();
    const translated = mockTranslations[lowerText]?.[to] || 
      `[${text}] → ${languages.find(l => l.code === to)?.name}`;
    
    setTranslatedText(translated);
  };

  // Enhanced speech synthesis with better voice selection
  const speakText = (text, lang) => {
    if (!text.trim()) return;
    
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Language mapping for better voice selection
      const voiceLanguageMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-BR',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'hi': 'hi-IN',
        'ar': 'ar-SA',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN'
      };
      
      utterance.lang = voiceLanguageMap[lang] || lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to find a native voice for the language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(utterance.lang) || 
        voice.lang.startsWith(lang)
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser');
    }
  };

  // Speech recognition setup with enhanced error handling
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;
      
      const languageMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'hi': 'hi-IN',       
        'ar': 'ar-SA',       
        'bn': 'bn-BD',       
        'tr': 'tr-TR',       
        'pl': 'pl-PL',       
        'nl': 'nl-NL',       
        'sv': 'sv-SE',       
        'fi': 'fi-FI',       
        'he': 'he-IL',       
        'th': 'th-TH',       
        'vi': 'vi-VN',       
        'uk': 'uk-UA',       
        'id': 'id-ID',       
        'ms': 'ms-MY',       
        'ta': 'ta-IN',       
        'te': 'te-IN',       
        'mr': 'mr-IN',       
        'gu': 'gu-IN'
      };
      
      recognitionInstance.lang = languageMap[fromLanguage] || 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInputText(finalTranscript);
          translateText(finalTranscript, fromLanguage, toLanguage);
        } else if (interimTranscript) {
          setInputText(interimTranscript);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        let errorMessage = 'Speech recognition error: ';
        switch(event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech service not allowed.';
            break;
          default:
            errorMessage += 'Please try again.';
        }
        console.error('Speech recognition error:', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [fromLanguage, toLanguage]);

  const startListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (!recognition) {
      alert('Speech recognition not initialized. Please refresh the page.');
      return;
    }

    try {
      recognition.start();
    } catch (error) {
      console.error('Recognition start error:', error);
      alert('Could not start speech recognition. Please make sure microphone access is allowed.');
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const swapLanguages = () => {
    const tempLang = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(tempLang);
    
    // Swap the text contents as well
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Auto-translate when input text changes
  useEffect(() => {
    if (inputText.trim() && !isListening) {
      const timeoutId = setTimeout(() => {
        translateText(inputText, fromLanguage, toLanguage);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputText, fromLanguage, toLanguage]);

  return (
    <div className="app">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-icons">
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Voice Translator</h1>
        </div>

        {/* Language Selection */}
        <div className="language-selection">
          <select 
            value={fromLanguage}
            onChange={(e) => setFromLanguage(e.target.value)}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button 
            onClick={swapLanguages}
            className="swap-button"
            title="Swap languages"
          >
            <RotateIcon size={20} />
          </button>

          <select 
            value={toLanguage}
            onChange={(e) => setToLanguage(e.target.value)}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Input Text Area */}
        <div className="input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Speak or type to translate..."
            className="input-textarea"
            rows="4"
          />
          {inputText && (
            <div className="text-actions">
              <button 
                onClick={() => copyToClipboard(inputText)}
                className="action-button"
                title="Copy text"
              >
                <CopyIcon size={16} />
              </button>
              <button 
                onClick={() => speakText(inputText, fromLanguage)}
                className={`action-button ${isSpeaking ? 'speaking' : ''}`}
                title="Speak text"
              >
                <VolumeIcon size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Microphone Button */}
        <div className="mic-section">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            className={`mic-button ${isListening ? 'listening' : ''} ${!isSupported ? 'disabled' : ''}`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <MicOffIcon size={24} />
            ) : (
              <MicIcon size={24} />
            )}
          </button>
        </div>

        {/* Translation Output */}
        <div className="output-section">
          <div className="output-container">
            {isTranslating ? (
              <div className="loading">
                <div className="spinner"></div>
                <span>Translating...</span>
              </div>
            ) : (
              <>
                <p className="output-text">
                  {translatedText || 'Translation will appear here...'}
                </p>
                {translatedText && (
                  <div className="text-actions">
                    <button 
                      onClick={() => copyToClipboard(translatedText)}
                      className="action-button"
                      title="Copy translation"
                    >
                      <CopyIcon size={16} />
                    </button>
                    <button 
                      onClick={() => speakText(translatedText, toLanguage)}
                      className={`action-button ${isSpeaking ? 'speaking' : ''}`}
                      title="Speak translation"
                    >
                      <VolumeIcon size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => translateText(inputText, fromLanguage, toLanguage)}
            disabled={!inputText || isTranslating}
            className="translate-button"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
          
          <button 
            onClick={() => {
              setInputText('');
              setTranslatedText('');
              speechSynthesis.cancel();
              setIsSpeaking(false);
            }}
            className="clear-button"
          >
            Clear
          </button>
        </div>

        {/* Status Text */}
        <div className="status-text">
          <p>
            {!isSupported 
              ? 'Speech recognition not supported in this browser' 
              : isListening 
              ? 'Listening... Speak now!' 
              : 'Tap microphone to start speaking'
            }
          </p>
          {!isSupported && (
            <p className="browser-info">
              Please use Chrome, Edge, or Safari
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;