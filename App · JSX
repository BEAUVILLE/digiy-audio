import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Play, Trash2, Copy, Download, Globe, Settings, Zap } from 'lucide-react';

const LANGUAGES = {
  'fr': 'Français',
  'en': 'English',
  'wo': 'Wolof',
  'fr-di': 'Diola',
  'fr-man': 'Mandingue'
};

export default function DIGIYAudio() {
  const [article, setArticle] = useState('');
  const [translatedArticle, setTranslatedArticle] = useState('');
  const [articles, setArticles] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('reader');
  const [showSettings, setShowSettings] = useState(false);
  const speechSynthesisRef = useRef(null);

  // Charger articles depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('digiyAudioArticles');
    if (saved) {
      setArticles(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder articles dans localStorage
  useEffect(() => {
    localStorage.setItem('digiyAudioArticles', JSON.stringify(articles));
  }, [articles]);

  // Traduction simple (utilise Google Translate API gratuite)
  const translateText = async (text, targetLang) => {
    if (targetLang === 'fr') {
      return text;
    }

    try {
      // Utilise l'API publique MyMemory (gratuite, sans auth)
      const encodedText = encodeURIComponent(text.substring(0, 500));
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=fr|${targetLang}`
      );
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
    } catch (error) {
      console.log('Traduction non disponible');
    }
    
    return text;
  };

  const handleAddArticle = async () => {
    if (article.trim()) {
      const newArticle = {
        id: Date.now(),
        original: article,
        title: article.substring(0, 50) + '...',
        timestamp: new Date().toLocaleString('fr-FR'),
        language: 'fr'
      };

      setArticles([newArticle, ...articles]);
      setArticle('');
      setSelectedArticle(newArticle);
      setActiveTab('reader');
    }
  };

  const handleSpeak = async (text) => {
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = text;
    if (selectedLanguage !== 'fr') {
      textToSpeak = await translateText(text, selectedLanguage);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.lang = selectedLanguage === 'fr' ? 'fr-FR' : selectedLanguage;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handleDeleteArticle = (id) => {
    setArticles(articles.filter(a => a.id !== id));
    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
    }
  };

  const handleStopSpeak = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    speechSynthesisRef.current = null;
  };

  const currentArticle = selectedArticle || articles[0];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-b shadow-lg`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              DIGIY AUDIO
            </h1>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-indigo-100 hover:bg-indigo-200'}`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className={`border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-200'} p-4`}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Police */}
              <div>
                <label className="block text-sm font-semibold mb-2">Taille police: {fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Vitesse */}
              <div>
                <label className="block text-sm font-semibold mb-2">Vitesse: {(speechRate * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Mode sombre */}
              <div>
                <label className="block text-sm font-semibold mb-2">Apparence</label>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-gray-900'}`}
                >
                  {darkMode ? '🌙 Mode sombre' : '☀️ Mode clair'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR - INPUT & HISTORY */}
          <div className="lg:col-span-1 space-y-6">
            {/* INPUT ARTICLE */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Ajouter article
              </h2>
              <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Colle ou écris ton article ici..."
                className={`w-full h-32 p-3 rounded-lg border-2 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-indigo-200 placeholder-gray-400'} focus:outline-none focus:border-indigo-500 resize-none`}
              />
              <button
                onClick={handleAddArticle}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
              >
                📥 Ajouter
              </button>
            </div>

            {/* HISTORIQUE */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-6 shadow-lg`}>
              <h2 className="text-lg font-bold mb-4">📚 Historique</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {articles.length === 0 ? (
                  <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Aucun article encore...</p>
                ) : (
                  articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedArticle?.id === art.id
                          ? 'bg-indigo-600 text-white'
                          : darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <p className="text-sm font-semibold truncate">{art.title}</p>
                      <p className={`text-xs ${selectedArticle?.id === art.id ? 'text-indigo-100' : darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {art.timestamp}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT - READER */}
          <div className="lg:col-span-2">
            {currentArticle ? (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-8 shadow-lg`}>
                {/* TOOLBAR */}
                <div className="mb-6 pb-6 border-b border-indigo-300 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSpeak(currentArticle.original)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                        isSpeaking
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <Pause className="w-5 h-5" />
                          Arrêter
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5" />
                          Écouter
                        </>
                      )}
                    </button>
                  </div>

                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 border-indigo-300 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white'} focus:outline-none`}
                  >
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDeleteArticle(currentArticle.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* ARTICLE TEXT */}
                <div
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                  className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}
                >
                  {currentArticle.original}
                </div>

                {/* STATS */}
                <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-indigo-200'} flex gap-4 text-sm`}>
                  <div className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                    📝 {currentArticle.original.split(' ').length} mots
                  </div>
                  <div className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                    ⏱️ ~{Math.ceil(currentArticle.original.split(' ').length / 130)} min de lecture
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-12 shadow-lg text-center`}>
                <Volume2 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-indigo-300'}`} />
                <p className={`text-xl font-bold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Ajoute un article pour commencer! 🚀
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className={`mt-12 py-6 border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
            🦅 DIGIY AUDIO - L'Afrique enracinée, connectée au monde ∞
          </p>
        </div>
      </footer>
    </div>
  );
}
