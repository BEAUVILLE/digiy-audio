import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Trash2, Copy, Settings, Zap } from 'lucide-react';

const LANGUAGES = {
  fr: 'Français',
  en: 'Anglais'
};

const WELCOME_ARTICLE = {
  id: 'digiy-audio-premiere-ecoute',
  original:
`Bienvenue dans DIGIY AUDIO.

Ici, tu peux coller un texte, un article, une note, une idée ou un message important, puis le garder pour l’écouter plus tard.

DIGIY AUDIO n’est pas seulement un bouton lecture.
C’est une petite bibliothèque d’écoute.

Tu peux ranger tes textes, les retrouver, les relire à l’oreille, apprendre en marchant, écouter pendant que tu travailles, ou reprendre une idée quand tes yeux sont fatigués.

Le but est simple : transformer les textes en parole utile.

Tu poses le texte.
DIGIY le garde dans ton navigateur.
Tu l’écoutes quand tu veux.

Un article long, une note de travail, un message important, une réflexion, une explication ou une idée : tout peut devenir une écoute.

DIGIY AUDIO aide à ne pas perdre les mots.
Il donne une voix aux textes.

DIGIY AUDIO est offert pour commencer simplement.
Les options avancées pourront venir plus tard dans les offres DIGIY.`,
  title: 'Première écoute — comprendre DIGIY AUDIO',
  timestamp: 'Toujours disponible',
  language: 'fr',
  isWelcome: true
};

function getInitialArticles() {
  try {
    const saved = localStorage.getItem('digiyAudioArticles');
    const parsed = saved ? JSON.parse(saved) : [];

    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasWelcome = parsed.some((item) => item && item.id === WELCOME_ARTICLE.id);
      return hasWelcome ? parsed : [WELCOME_ARTICLE, ...parsed];
    }
  } catch (error) {
    console.warn('Historique DIGIY AUDIO illisible, première écoute chargée.');
  }

  return [WELCOME_ARTICLE];
}

function makeTitle(text) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return 'Texte à écouter';

  return clean.length > 54 ? `${clean.slice(0, 54)}...` : clean;
}

function pickFrenchVoice() {
  try {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    return (
      voices.find((voice) => /fr[-_]?FR/i.test(voice.lang || '') && /google|audrey|amelie|hortense|julie|thomas|paul|french/i.test(voice.name || '')) ||
      voices.find((voice) => /^fr/i.test(voice.lang || '')) ||
      null
    );
  } catch (error) {
    return null;
  }
}

export default function DIGIYAudio() {
  const [article, setArticle] = useState('');
  const [articles, setArticles] = useState(getInitialArticles);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.78);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const speechSynthesisRef = useRef(null);

  // Sauvegarder les textes dans localStorage.
  // La première écoute est conservée avec l'historique pour rester disponible.
  useEffect(() => {
    localStorage.setItem('digiyAudioArticles', JSON.stringify(articles));
  }, [articles]);

  // Traduction simple (utilise MyMemory, gratuit et sans authentification).
  const translateText = async (text, targetLang) => {
    if (targetLang === 'fr') {
      return text;
    }

    try {
      const encodedText = encodeURIComponent(String(text || '').substring(0, 500));
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
    if (!article.trim()) return;

    const newArticle = {
      id: Date.now(),
      original: article.trim(),
      title: makeTitle(article),
      timestamp: new Date().toLocaleString('fr-FR'),
      language: 'fr'
    };

    setArticles((current) => [newArticle, ...current]);
    setArticle('');
    setSelectedArticle(newArticle);
  };

  const handleSpeak = async (text) => {
    if (!text) return;

    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
      return;
    }

    let textToSpeak = text;
    if (selectedLanguage !== 'fr') {
      textToSpeak = await translateText(text, selectedLanguage);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.lang = selectedLanguage === 'fr' ? 'fr-FR' : selectedLanguage;

    if (selectedLanguage === 'fr') {
      const voice = pickFrenchVoice();
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handleDeleteArticle = (id) => {
    if (id === WELCOME_ARTICLE.id) return;

    setArticles((current) => current.filter((item) => item.id !== id));

    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
    }
  };

  const handleStopSpeak = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    speechSynthesisRef.current = null;
  };

  useEffect(() => {
    return () => {
      try {
        speechSynthesis.cancel();
      } catch (error) {
        // Rien à faire : certains navigateurs coupent déjà la voix au démontage.
      }
    };
  }, []);

  const currentArticle = selectedArticle || articles[0];
  const userArticlesCount = articles.filter((item) => !item.isWelcome).length;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-b shadow-lg`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Zap className="w-8 h-8 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                DIGIY AUDIO
              </h1>
              <p className={`mt-1 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                DIGIY AUDIO est offert pour commencer simplement : range tes textes, articles et notes, puis reviens les écouter quand tu veux.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-indigo-100 hover:bg-indigo-200'}`}
            aria-label="Ouvrir les réglages"
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
        {/* INTRO */}
        <section className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-6 shadow-lg mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-wide">Première écoute déjà prête</p>
              <h2 className="mt-1 text-2xl font-black">Comprendre DIGIY AUDIO</h2>
              <div className={`mt-3 inline-flex rounded-full px-3 py-2 text-xs font-black ${darkMode ? 'bg-emerald-900/50 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>
                Offert pour écouter simplement tes textes
              </div>
              <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                DIGIY AUDIO est offert comme outil d’écoute simple. Clique sur écouter pour comprendre comment stocker un texte,
                le retrouver, puis l’écouter à l’oreille. Les options avancées pourront venir plus tard dans les offres DIGIY.
              </p>
            </div>

            <button
              onClick={() => handleSpeak(WELCOME_ARTICLE.original)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition ${
                isSpeaking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-green-400 hover:from-emerald-700 hover:to-green-500 text-slate-950'
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
                  Écouter la première explication
                </>
              )}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR - INPUT & HISTORY */}
          <div className="lg:col-span-1 space-y-6">
            {/* INPUT TEXT */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Ajouter un texte
              </h2>
              <p className={`text-sm mb-4 leading-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Colle un article, une note, une idée, un message important ou un texte à reprendre plus tard.
              </p>
              <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Colle ou écris ton texte ici..."
                className={`w-full h-32 p-3 rounded-lg border-2 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-indigo-200 placeholder-gray-400'} focus:outline-none focus:border-indigo-500 resize-none`}
              />
              <button
                onClick={handleAddArticle}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
              >
                📥 Ranger ce texte
              </button>
            </div>

            {/* HISTORIQUE */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-6 shadow-lg`}>
              <h2 className="text-lg font-bold mb-1">📚 Mes textes à écouter</h2>
              <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {userArticlesCount} texte(s) ajouté(s) + la première écoute DIGIY.
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedArticle?.id === art.id || (!selectedArticle && articles[0]?.id === art.id)
                        ? 'bg-indigo-600 text-white'
                        : darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <p className="text-sm font-semibold truncate">
                      {art.isWelcome ? '🎧 ' : ''}
                      {art.title}
                    </p>
                    <p className={`text-xs ${selectedArticle?.id === art.id ? 'text-indigo-100' : darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {art.timestamp}
                    </p>
                  </div>
                ))}
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
                          : 'bg-gradient-to-r from-emerald-600 to-green-400 hover:from-emerald-700 hover:to-green-500 text-slate-950'
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
                          Écouter ce texte
                        </>
                      )}
                    </button>
                  </div>

                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 border-indigo-300 ${darkMode ? 'bg-slate-700 text-white' : 'bg-white'} focus:outline-none`}
                    aria-label="Langue d'écoute"
                  >
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>

                  {!currentArticle.isWelcome && (
                    <button
                      onClick={() => handleDeleteArticle(currentArticle.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      aria-label="Supprimer ce texte"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* ARTICLE TITLE */}
                <div className="mb-6">
                  <p className={`text-xs font-black uppercase tracking-wide ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                    {currentArticle.isWelcome ? 'Première écoute' : 'Texte rangé'}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{currentArticle.title}</h2>
                </div>

                {/* ARTICLE TEXT */}
                <div
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                  className={`prose max-w-none whitespace-pre-wrap ${darkMode ? 'prose-invert' : ''}`}
                >
                  {currentArticle.original}
                </div>

                {/* STATS */}
                <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-indigo-200'} flex gap-4 text-sm flex-wrap`}>
                  <div className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                    📝 {currentArticle.original.split(/\s+/).filter(Boolean).length} mots
                  </div>
                  <div className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                    ⏱️ ~{Math.ceil(currentArticle.original.split(/\s+/).filter(Boolean).length / 130)} min d’écoute
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200'} border-2 rounded-xl p-12 shadow-lg text-center`}>
                <Volume2 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-indigo-300'}`} />
                <p className={`text-xl font-bold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Ajoute un texte pour commencer! 🚀
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
            🦅 DIGIY AUDIO — outil offert d’écoute simple · textes, articles, notes ∞
          </p>
        </div>
      </footer>
    </div>
  );
}
