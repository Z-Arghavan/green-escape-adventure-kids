
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Key, Puzzle, Search, Users, Clock, Lightbulb, ArrowRight } from 'lucide-react';

type Language = 'en' | 'nl';

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showDescription, setShowDescription] = useState(false);

  const translations = {
    en: {
      title: "Green Escape: Return from the future",
      startButton: "START THE ROOM",
      languagePrompt: "Choose your language:",
      welcome: "🌍 Welcome to the Green Escape: Return from the future",
      intro: "You've just entered the office of a brilliant researcher. He travelled to the future to find solutions for our planet's most pressing problems—climate change, pollution, waste, and more. But something went wrong...",
      problem: "🚨 On his return, the researcher got trapped in his time machine!",
      problemDesc: "Now it's up to you to help him.",
      missionTitle: "Your mission:",
      mission1: "🔑 Find all the keys hidden in this room.",
      mission2: "🧩 Each key is unlocked by solving a mini-game—some are digital, some are physical.",
      mission3: "🕵️‍♀️ Every game gives you a clue to the next challenge.",
      mission4: "🔐 The final key will unlock the time machine and set the researcher free!",
      howToPlayTitle: "🧭 How to Play",
      howToPlay1: "Start anywhere you like. There's no single path, but you'll need to solve all challenges to find the final key.",
      howToPlay2: "Look around carefully. There are clues hidden in objects, notes, screens, or even in plain sight.",
      howToPlay3: "Work as a team! Children and parents should work together—two brains are better than one.",
      miniGamesTitle: "Mini-Games Ahead:",
      miniGames1: "Some games are on a tablet or computer",
      miniGames2: "Others involve puzzles, hidden messages, or physical items",
      afterSolvingTitle: "After solving each mini-game:",
      afterSolving1: "You'll receive a piece of information or a number",
      afterSolving2: "Keep track of these clues—they build up your path to the next key",
      stuckTitle: "If you're stuck:",
      stuck: "Ask a guide or look around again—sometimes clues are right where you started",
      backToStart: "Back to Start"
    },
    nl: {
      title: "Green Escape: Terugkeer uit de toekomst",
      startButton: "START DE KAMER",
      languagePrompt: "Kies je taal:",
      welcome: "🌍 Welkom bij de Green Escape: Terugkeer uit de toekomst",
      intro: "Je bent net het kantoor binnengekomen van een briljante onderzoeker. Hij reisde naar de toekomst om oplossingen te vinden voor de meest urgente problemen van onze planeet—klimaatverandering, vervuiling, afval, en meer. Maar er ging iets mis...",
      problem: "🚨 Bij zijn terugkeer raakte de onderzoeker gevangen in zijn tijdmachine!",
      problemDesc: "Nu is het aan jou om hem te helpen.",
      missionTitle: "Jouw missie:",
      mission1: "🔑 Vind alle sleutels die verstopt zijn in deze kamer.",
      mission2: "🧩 Elke sleutel wordt ontgrendeld door een mini-spel op te lossen—sommige zijn digitaal, sommige zijn fysiek.",
      mission3: "🕵️‍♀️ Elk spel geeft je een aanwijzing voor de volgende uitdaging.",
      mission4: "🔐 De laatste sleutel zal de tijdmachine ontgrendelen en de onderzoeker bevrijden!",
      howToPlayTitle: "🧭 Hoe te spelen",
      howToPlay1: "Begin waar je wilt. Er is geen enkel pad, maar je moet alle uitdagingen oplossen om de laatste sleutel te vinden.",
      howToPlay2: "Kijk goed rond. Er zijn aanwijzingen verstopt in voorwerpen, notities, schermen, of zelfs op het eerste gezicht.",
      howToPlay3: "Werk samen! Kinderen en ouders moeten samenwerken—twee breinen zijn beter dan één.",
      miniGamesTitle: "Mini-Spellen voor je:",
      miniGames1: "Sommige spellen zijn op een tablet of computer",
      miniGames2: "Andere bevatten puzzels, verborgen berichten, of fysieke voorwerpen",
      afterSolvingTitle: "Na het oplossen van elk mini-spel:",
      afterSolving1: "Je krijgt een stukje informatie of een nummer",
      afterSolving2: "Houd deze aanwijzingen bij—ze bouwen je pad naar de volgende sleutel op",
      stuckTitle: "Als je vastzit:",
      stuck: "Vraag een gids of kijk nog eens rond—soms zijn aanwijzingen precies waar je begon",
      backToStart: "Terug naar Start"
    }
  };

  const handleStartRoom = () => {
    setShowDescription(true);
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleBackToStart = () => {
    setShowDescription(false);
    setSelectedLanguage(null);
  };

  if (!showDescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">🌍</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Green Escape
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow">
              Return from the future
            </p>
          </div>
          
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-md mx-auto">
            <CardContent className="p-8 space-y-6">
              <Button 
                onClick={handleStartRoom}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ArrowRight className="mr-3 h-6 w-6" />
                START THE ROOM
              </Button>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4 font-medium">Choose your language:</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => handleLanguageSelect('en')}
                    variant="outline"
                    className="flex-1 h-12 font-medium hover:bg-blue-50 border-2 hover:border-blue-300"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    English
                  </Button>
                  <Button
                    onClick={() => handleLanguageSelect('nl')}
                    variant="outline"
                    className="flex-1 h-12 font-medium hover:bg-green-50 border-2 hover:border-green-300"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Nederlands
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedLanguage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Choose your language</h2>
            <p className="text-gray-600">Kies je taal</p>
            <div className="space-y-4">
              <Button
                onClick={() => handleLanguageSelect('en')}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Globe className="mr-3 h-6 w-6" />
                English
              </Button>
              <Button
                onClick={() => handleLanguageSelect('nl')}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                <Globe className="mr-3 h-6 w-6" />
                Nederlands
              </Button>
            </div>
            <Button
              onClick={handleBackToStart}
              variant="outline"
              className="w-full mt-4"
            >
              Back / Terug
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const t = translations[selectedLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🌍</div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {t.title}
              </h1>
            </div>

            <div className="space-y-6 text-lg leading-relaxed">
              <div className="bg-green-100 p-6 rounded-xl border-l-4 border-green-500">
                <h2 className="text-2xl font-bold text-green-800 mb-3">{t.welcome}</h2>
                <p className="text-gray-700">{t.intro}</p>
              </div>

              <div className="bg-red-100 p-6 rounded-xl border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-red-800 mb-2">{t.problem}</h3>
                <p className="text-gray-700">{t.problemDesc}</p>
              </div>

              <div className="bg-blue-100 p-6 rounded-xl border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  {t.missionTitle}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.mission1}
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.mission2}
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.mission3}
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.mission4}
                  </li>
                </ul>
              </div>

              <div className="bg-purple-100 p-6 rounded-xl border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  {t.howToPlayTitle}
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>{t.howToPlay1}</p>
                  <p>{t.howToPlay2}</p>
                  <p className="flex items-start">
                    <Users className="mr-2 h-5 w-5 mt-0.5 text-purple-600" />
                    {t.howToPlay3}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-100 p-6 rounded-xl border-l-4 border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                  <Puzzle className="mr-2 h-5 w-5" />
                  {t.miniGamesTitle}
                </h3>
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.miniGames1}
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.miniGames2}
                  </li>
                </ul>
                
                <h4 className="font-bold text-yellow-800 mb-2">{t.afterSolvingTitle}</h4>
                <ul className="space-y-1 text-gray-700 mb-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.afterSolving1}
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    {t.afterSolving2}
                  </li>
                </ul>

                <div className="bg-yellow-200 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {t.stuckTitle}
                  </h4>
                  <p className="text-gray-700">{t.stuck}</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={handleBackToStart}
                variant="outline"
                className="px-8 py-3 text-lg font-medium hover:bg-gray-50"
              >
                {t.backToStart}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
