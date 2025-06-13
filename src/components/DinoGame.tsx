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
  const [hits, setHits] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [inventory, setInventory] = useState<Array<{type: string, name: string}>>([]);
  const [pointsAnimations, setPointsAnimations] = useState<Array<{id: number, points: string, x: number, y: number, color: string}>>([]);

  const translations = {
    en: {
      title: "Sustainable Dino Game",
      instructions: "Collect green energy items (+100 points) and avoid waste! You can be hit 3 times before game over.",
      spaceInstructions: "Use SPACE key or click the game area to jump! Double jump available!",
      start: "Start Game",
      restart: "Restart Game",
      tryAgain: "Try Again",
      gameOver: "Game Over!",
      score: "Score",
      hits: "Hits",
      gamesLeft: "Games left",
      completed: "Well done! You've completed all 3 games!",
      yourCode: "Your code is:",
      useThisCode: "Use this code for the next challenge!",
      back: "Back to Instructions",
      inventory: "Collected Items:",
      collected: "Collected"
    },
    nl: {
      title: "Duurzame Dino Spel",
      instructions: "Verzamel groene energie items (+100 punten) en vermijd afval! Je kunt 3 keer geraakt worden voor game over.",
      spaceInstructions: "Gebruik de SPATIE toets of klik op het speelveld om te springen! Dubbel springen mogelijk!",
      start: "Start Spel",
      restart: "Herstart Spel",
      tryAgain: "Probeer Opnieuw",
      gameOver: "Game Over!",
      score: "Score",
      hits: "Treffers",
      gamesLeft: "Spellen over",
      completed: "Goed gedaan! Je hebt alle 3 spellen voltooid!",
      yourCode: "Je code is:",
      useThisCode: "Gebruik deze code voor de volgende uitdaging!",
      back: "Terug naar Instructies",
      inventory: "Verzamelde Items:",
      collected: "Verzameld"
    }
  };

  const t = translations[selectedLanguage];

  // Game objects
  const gameRef = useRef({
    dino: { x: 50, y: 200, width: 30, height: 30, velocityY: 0, isJumping: false, jumpCount: 0 },
    collectibles: [] as Array<{ x: number; y: number; width: number; height: number; type: string; name: string; isCollectible: boolean }>,
    clouds: [] as Array<{ x: number; y: number; speed: number; size: number }>,
    gameSpeed: 2, // Match cloud speed - slower and consistent
    score: 0,
    hits: 0,
    gameRunning: false,
    lastSpawnTime: 0 // Add timing for spawn spacing
  });

  const collectibleTypes = [
    { type: '♻️', name: 'Recycling Symbol', isCollectible: true },
    { type: '🌱', name: 'Green Plant', isCollectible: true },
    { type: '⚡', name: 'Clean Energy', isCollectible: true },
    { type: '🌿', name: 'Natural Leaf', isCollectible: true },
    { type: '🌍', name: 'Earth Care', isCollectible: true },
    { type: '🔋', name: 'Battery Power', isCollectible: true },
    { type: '🚲', name: 'Eco Transport', isCollectible: true },
    { type: '🌞', name: 'Solar Energy', isCollectible: true }
  ];

  const obstacleTypes = [
    { type: '🗑️', name: 'Trash Bin', isCollectible: false },
    { type: '🚗', name: 'Pollution Car', isCollectible: false },
    { type: '🏭', name: 'Factory Smoke', isCollectible: false },
    { type: '💨', name: 'Air Pollution', isCollectible: false },
    { type: '🛢️', name: 'Oil Barrel', isCollectible: false },
    { type: '🔥', name: 'Burning Waste', isCollectible: false },
    { type: '☢️', name: 'Nuclear Waste', isCollectible: false },
    { type: '🚬', name: 'Cigarette Pollution', isCollectible: false }
  ];

  const addPointsAnimation = useCallback((points: string, x: number, y: number, color: string) => {
    const id = Date.now() + Math.random();
    setPointsAnimations(prev => [...prev, { id, points, x, y, color }]);
    setTimeout(() => {
      setPointsAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 1500);
  }, []);

  const checkItemOverlap = useCallback((newX: number, newY: number, newWidth: number, newHeight: number) => {
    const game = gameRef.current;
    const minDistance = 80; // Minimum distance between items to prevent overlap
    
    return game.collectibles.some(item => {
      const distance = Math.sqrt(
        Math.pow(newX - item.x, 2) + Math.pow(newY - item.y, 2)
      );
      return distance < minDistance;
    });
  }, []);

  const resetGame = useCallback(() => {
    const game = gameRef.current;
    game.dino = { x: 50, y: 200, width: 30, height: 30, velocityY: 0, isJumping: false, jumpCount: 0 };
    game.collectibles = [];
    game.clouds = [
      { x: 200, y: 50, speed: 0.5, size: 40 },
      { x: 500, y: 80, speed: 0.3, size: 50 },
      { x: 700, y: 40, speed: 0.7, size: 35 }
    ];
    game.gameSpeed = 2; // Keep consistent with cloud speed
    game.score = 0;
    game.hits = 0;
    game.gameRunning = true;
    game.lastSpawnTime = 0;
    setScore(0);
    setHits(0);
    setGameState('playing');
    setInventory([]);
    setPointsAnimations([]);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const restartCurrentGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (game.gameRunning && game.dino.jumpCount < 2) {
      game.dino.velocityY = -18;
      game.dino.isJumping = true;
      game.dino.jumpCount++;
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    
    if (!game.gameRunning) return;

    const currentTime = Date.now();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw clouds with proper spacing
    game.clouds.forEach((cloud, index) => {
      cloud.x -= cloud.speed;
      if (cloud.x < -cloud.size) {
        cloud.x = canvas.width + cloud.size;
        // Ensure clouds don't overlap when respawning
        const otherClouds = game.clouds.filter((_, i) => i !== index);
        while (otherClouds.some(other => Math.abs(cloud.x - other.x) < 150)) {
          cloud.x += 50;
        }
      }
      
      // Draw cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = `${cloud.size}px Arial`;
      ctx.fillText('☁️', cloud.x, cloud.y);
    });

    // Update dino physics
    game.dino.velocityY += 0.8; // gravity
    game.dino.y += game.dino.velocityY;

    // Ground collision
    if (game.dino.y >= 200) {
      game.dino.y = 200;
      game.dino.velocityY = 0;
      game.dino.isJumping = false;
      game.dino.jumpCount = 0;
    }

    // Draw ground
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, 235, canvas.width, 15);

    // Draw dino using T-Rex emoji (mirrored and bigger)
    ctx.save();
    ctx.font = '35px Arial';
    ctx.scale(-1, 1); // Mirror horizontally
    ctx.fillText('🦖', -game.dino.x - 35, game.dino.y + 25);
    ctx.restore();

    // Spawn items with proper spacing and timing
    if (currentTime - game.lastSpawnTime > 1000 && Math.random() < 0.02) { // Minimum 1 second between spawns
      const allItems = [...collectibleTypes, ...obstacleTypes];
      const itemType = allItems[Math.floor(Math.random() * allItems.length)];
      const newX = canvas.width;
      const newY = itemType.isCollectible ? 205 : 210;
      const newWidth = 25;
      const newHeight = 25;
      
      // Only spawn if it won't overlap with existing items
      if (!checkItemOverlap(newX, newY, newWidth, newHeight)) {
        game.collectibles.push({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          type: itemType.type,
          name: itemType.name,
          isCollectible: itemType.isCollectible
        });
        game.lastSpawnTime = currentTime;
      }
    }

    // Update and draw items - using consistent game speed
    game.collectibles = game.collectibles.filter(item => {
      item.x -= game.gameSpeed; // Use consistent speed matching clouds

      // Draw item with proper spacing from other elements
      ctx.font = '25px Arial';
      ctx.fillText(item.type, item.x, item.y + 20);

      // Improved collision detection with larger hitbox for collectibles
      const dinoHitbox = {
        x: game.dino.x + 5,
        y: game.dino.y + 5,
        width: game.dino.width - 10,
        height: game.dino.height - 10
      };

      const itemHitbox = {
        x: item.x + (item.isCollectible ? 2 : 5),
        y: item.y + (item.isCollectible ? 2 : 5),
        width: item.width - (item.isCollectible ? 4 : 10),
        height: item.height - (item.isCollectible ? 4 : 10)
      };

      if (
        dinoHitbox.x < itemHitbox.x + itemHitbox.width &&
        dinoHitbox.x + dinoHitbox.width > itemHitbox.x &&
        dinoHitbox.y < itemHitbox.y + itemHitbox.height &&
        dinoHitbox.y + dinoHitbox.height > itemHitbox.y
      ) {
        if (item.isCollectible) {
          // Collect the item
          setInventory(prev => {
            const existing = prev.find(inv => inv.type === item.type);
            if (!existing) {
              return [...prev, { type: item.type, name: item.name }];
            }
            return prev;
          });
          game.score += 100;
          setScore(game.score);
          addPointsAnimation('+100', item.x, item.y, '#22c55e');
          return false;
        } else {
          // Hit an obstacle
          game.hits += 1;
          game.score = Math.max(0, game.score - 100);
          setScore(game.score);
          setHits(game.hits);
          addPointsAnimation('-100', item.x, item.y, '#ef4444');
          
          if (game.hits >= 3) {
            game.gameRunning = false;
            setGameState('gameOver');
          }
          return false;
        }
      }

      return item.x > -item.width;
    });

    // Remove speed increase - keep consistent speed
    // Speed no longer increases with score

    if (game.gameRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [addPointsAnimation, checkItemOverlap]);

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
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-4xl mx-auto relative">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-gray-600 mb-2">{t.instructions}</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">{t.spaceInstructions}</p>
          </div>

          {inventory.length > 0 && (
            <div className="mb-4 p-4 bg-green-100 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">{t.inventory}</h3>
              <div className="flex flex-wrap gap-2">
                {inventory.map((item, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border">
                    {item.type} {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mb-6 relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={250}
              className="border-2 border-gray-300 rounded-lg bg-gradient-to-b from-blue-200 to-green-200"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {/* Score display overlay in top right of canvas */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
              <div className="text-xs space-y-1 text-gray-700 font-medium">
                <div>{t.score}: {score}</div>
                <div>{t.hits}: {hits}/3</div>
                <div>{t.gamesLeft}: {3 - gamesPlayed}</div>
              </div>
            </div>
            
            {/* Points animations overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {pointsAnimations.map((anim) => (
                <div
                  key={anim.id}
                  className="absolute text-lg font-bold animate-bounce"
                  style={{
                    left: `${(anim.x / 800) * 100}%`,
                    top: `${(anim.y / 250) * 100}%`,
                    color: anim.color,
                    animation: 'bounce 1.5s ease-out forwards'
                  }}
                >
                  {anim.points}
                </div>
              ))}
            </div>
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
                <p className="text-gray-600">{t.hits}: {hits}/3</p>
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
