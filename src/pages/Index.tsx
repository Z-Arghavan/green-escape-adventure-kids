
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ArrowRight } from 'lucide-react';
import DinoGame from '@/components/DinoGame';

type Language = 'en' | 'nl';

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [gameCode, setGameCode] = useState<string | null>(null);

  const translations = {
    en: {
      title: "The Green Dino Game",
      startButton: "START THE GAME",
      languagePrompt: "Choose your language:",
      welcome: "🌍 Welcome to The Green Dino Game",
      description: "Help our dinosaur friend collect positive environmental solutions while avoiding environmental challenges! Jump over pollution and hazards, but collect recycling, renewable energy, and other green solutions.",
      howToPlay: "How to Play:",
      instruction1: "🦖 Use SPACE key or click to jump",
      instruction2: "♻️ Collect green environmental solutions for points",
      instruction3: "💨 Avoid environmental challenges and pollution",
      instruction4: "🎯 Play 3 games to get your final score",
      backToStart: "Back to Start",
      startGame: "Start Game"
    },
    nl: {
      title: "Het Groene Dino Spel",
      startButton: "START HET SPEL",
      languagePrompt: "Kies je taal:",
      welcome: "🌍 Welkom bij Het Groene Dino Spel",
      description: "Help onze dinosaurus vriend positieve milieu-oplossingen te verzamelen terwijl je milieu-uitdagingen vermijdt! Spring over vervuiling en gevaren, maar verzamel recycling, hernieuwbare energie en andere groene oplossingen.",
      howToPlay: "Hoe te spelen:",
      instruction1: "🦖 Gebruik SPATIE toets of klik om te springen",
      instruction2: "♻️ Verzamel groene milieu-oplossingen voor punten",
      instruction3: "💨 Vermijd milieu-uitdagingen en vervuiling",
      instruction4: "🎯 Speel 3 spellen om je eindscore te krijgen",
      backToStart: "Terug naar Start",
      startGame: "Start Spel"
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
    setShowGame(false);
    setGameCode(null);
  };

  const handleStartGame = () => {
    setShowGame(true);
  };

  const handleGameComplete = (code: string) => {
    setGameCode(code);
    setShowGame(false);
  };

  const handleBackFromGame = () => {
    setShowGame(false);
  };

  if (showGame && selectedLanguage) {
    return (
      <DinoGame 
        onGameComplete={handleGameComplete}
        onBack={handleBackFromGame}
        selectedLanguage={selectedLanguage}
      />
    );
  }

  if (!showDescription) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">🦖</div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                The Green Dino Game
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow">
                Environmental Adventure
              </p>
            </div>
            
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-md mx-auto">
              <CardContent className="p-8 space-y-6">
                <Button 
                  onClick={handleStartRoom}
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <ArrowRight className="mr-3 h-6 w-6" />
                  START THE GAME
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
      </div>
    );
  }

  if (!selectedLanguage) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
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
      </div>
    );
  }

  const t = translations[selectedLanguage];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 p-4">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🦖</div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {t.title}
                </h1>
                {gameCode && (
                  <div className="bg-green-100 p-4 rounded-lg border-2 border-green-400 mb-4">
                    <p className="text-green-800 font-bold">Game completed! Code: {gameCode}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6 text-lg leading-relaxed">
                <div className="bg-green-100 p-6 rounded-xl border-l-4 border-green-500">
                  <h2 className="text-2xl font-bold text-green-800 mb-3">{t.welcome}</h2>
                  <p className="text-gray-700">{t.description}</p>
                </div>

                <div className="bg-blue-100 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">
                    {t.howToPlay}
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-3 text-xl">🦖</span>
                      {t.instruction1}
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 text-xl">♻️</span>
                      {t.instruction2}
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 text-xl">💨</span>
                      {t.instruction3}
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 text-xl">🎯</span>
                      {t.instruction4}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center mt-8 space-y-4">
                <Button
                  onClick={handleStartGame}
                  className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <ArrowRight className="mr-3 h-5 w-5" />
                  {t.startGame}
                </Button>
                
                <Button
                  onClick={handleBackToStart}
                  variant="outline"
                  className="px-8 py-3 text-lg font-medium hover:bg-gray-50 ml-4"
                >
                  {t.backToStart}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
