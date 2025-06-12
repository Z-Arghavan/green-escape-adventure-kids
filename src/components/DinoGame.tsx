
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface DinoGameProps {
  onGameComplete: (code: string) => void;
  onBack: () => void;
  selectedLanguage: 'en' | 'nl';
}

const DinoGame: React.FC<DinoGameProps> = ({ onGameComplete, onBack, selectedLanguage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'waiting'>('waiting');
  const [score, setScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const translations = {
    en: {
      title: "Sustainable Dino Game",
      instructions: "Press SPACE or click to jump over trash! Help clean the environment!",
      spaceInstructions: "Use SPACE key or click the game area to jump!",
      start: "Start Game",
      restart: "Restart Game",
      tryAgain: "Try Again",
      gameOver: "Game Over!",
      score: "Score",
      gamesLeft: "Games left",
      completed: "Well done! You've completed all 3 games!",
      yourCode: "Your code is:",
      useThisCode: "Use this code for the next challenge!",
      back: "Back to Instructions"
    },
    nl: {
      title: "Duurzame Dino Spel",
      instructions: "Druk op SPATIE of klik om over afval te springen! Help het milieu schoon te maken!",
      spaceInstructions: "Gebruik de SPATIE toets of klik op het speelveld om te springen!",
      start: "Start Spel",
      restart: "Herstart Spel",
      tryAgain: "Probeer Opnieuw",
      gameOver: "Game Over!",
      score: "Score",
      gamesLeft: "Spellen over",
      completed: "Goed gedaan! Je hebt alle 3 spellen voltooid!",
      yourCode: "Je code is:",
      useThisCode: "Gebruik deze code voor de volgende uitdaging!",
      back: "Terug naar Instructies"
    }
  };

  const t = translations[selectedLanguage];

  // Game objects
  const gameRef = useRef({
    dino: { x: 50, y: 150, width: 40, height: 40, velocityY: 0, isJumping: false },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: string }>,
    gameSpeed: 3,
    score: 0,
    gameRunning: false
  });

  const obstacleTypes = [
    { type: '🗑️', name: 'trash-bin' },
    { type: '📄', name: 'paper' },
    { type: '🍶', name: 'bottle' },
    { type: '🥤', name: 'cup' },
    { type: '🛍️', name: 'bag' }
  ];

  const resetGame = useCallback(() => {
    const game = gameRef.current;
    game.dino = { x: 50, y: 150, width: 40, height: 40, velocityY: 0, isJumping: false };
    game.obstacles = [];
    game.gameSpeed = 3;
    game.score = 0;
    game.gameRunning = true;
    setScore(0);
    setGameState('playing');
  }, []);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const restartCurrentGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (!game.dino.isJumping && game.gameRunning) {
      game.dino.velocityY = -12;
      game.dino.isJumping = true;
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    
    if (!game.gameRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update dino physics
    game.dino.velocityY += 0.8; // gravity
    game.dino.y += game.dino.velocityY;

    // Ground collision
    if (game.dino.y >= 150) {
      game.dino.y = 150;
      game.dino.velocityY = 0;
      game.dino.isJumping = false;
    }

    // Draw ground
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, 190, canvas.width, 10);

    // Draw dino
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height);
    
    // Add simple dino details
    ctx.fillStyle = '#fff';
    ctx.fillRect(game.dino.x + 25, game.dino.y + 8, 8, 8); // eye
    ctx.fillStyle = '#000';
    ctx.fillRect(game.dino.x + 27, game.dino.y + 10, 4, 4); // pupil

    // Spawn obstacles
    if (Math.random() < 0.005) {
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      game.obstacles.push({
        x: canvas.width,
        y: 160,
        width: 30,
        height: 30,
        type: obstacleType.type
      });
    }

    // Update and draw obstacles
    game.obstacles = game.obstacles.filter(obstacle => {
      obstacle.x -= game.gameSpeed;

      // Draw obstacle
      ctx.font = '30px Arial';
      ctx.fillText(obstacle.type, obstacle.x, obstacle.y + 25);

      // Collision detection
      if (
        game.dino.x < obstacle.x + obstacle.width &&
        game.dino.x + game.dino.width > obstacle.x &&
        game.dino.y < obstacle.y + obstacle.height &&
        game.dino.y + game.dino.height > obstacle.y
      ) {
        game.gameRunning = false;
        setGameState('gameOver');
        return false;
      }

      return obstacle.x > -obstacle.width;
    });

    // Update score
    game.score += 1;
    if (game.score % 10 === 0) {
      setScore(Math.floor(game.score / 10));
    }

    // Increase speed
    if (game.score % 300 === 0) {
      game.gameSpeed += 0.5;
    }

    if (game.gameRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
          jump();
        } else if (gameState === 'waiting') {
          startGame();
        }
      }
    };

    const handleClick = () => {
      if (gameState === 'playing') {
        jump();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [gameState, jump, startGame]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const handleRestart = () => {
    if (gamesPlayed < 2) {
      setGamesPlayed(prev => prev + 1);
      resetGame();
    } else {
      setGamesPlayed(3);
      setShowCode(true);
    }
  };

  const handleComplete = () => {
    onGameComplete('5555');
  };

  if (showCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600">{t.completed}</h2>
            
            <div className="bg-yellow-100 p-6 rounded-xl border-2 border-yellow-400">
              <p className="text-lg font-semibold text-gray-800 mb-2">{t.yourCode}</p>
              <div className="text-4xl font-bold text-green-600 font-mono">5555</div>
            </div>
            
            <p className="text-gray-600">{t.useThisCode}</p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
              >
                Continue
              </Button>
              <Button 
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-gray-600 mb-2">{t.instructions}</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">{t.spaceInstructions}</p>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <span>{t.score}: {score}</span>
              <span>{t.gamesLeft}: {3 - gamesPlayed}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="border-2 border-gray-300 rounded-lg bg-gradient-to-b from-blue-200 to-green-200"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <div className="text-center space-y-4">
            {gameState === 'waiting' && (
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-3 text-lg"
              >
                {t.start}
              </Button>
            )}

            {gameState === 'playing' && (
              <Button 
                onClick={restartCurrentGame}
                variant="outline"
                className="mx-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t.restart}
              </Button>
            )}

            {gameState === 'gameOver' && (
              <div className="space-y-3">
                <p className="text-xl font-bold text-red-600">{t.gameOver}</p>
                <p className="text-gray-600">{t.score}: {score}</p>
                {gamesPlayed < 2 ? (
                  <Button 
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-3"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t.tryAgain} ({2 - gamesPlayed} {t.gamesLeft})
                  </Button>
                ) : (
                  <Button 
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-3"
                  >
                    Finish Game & Get Code
                  </Button>
                )}
                <Button 
                  onClick={restartCurrentGame}
                  variant="outline"
                  className="ml-2"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.restart}
                </Button>
              </div>
            )}

            <Button 
              onClick={onBack}
              variant="outline"
              className="ml-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DinoGame;
