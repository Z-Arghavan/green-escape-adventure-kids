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
  const [avoidedChallenges, setAvoidedChallenges] = useState<Array<{type: string, name: string}>>([]);
  const [pointsAnimations, setPointsAnimations] = useState<Array<{id: number, points: string, x: number, y: number, color: string}>>([]);
  const [loadedImages, setLoadedImages] = useState<{[key: string]: HTMLImageElement}>({});

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
      avoidedChallenges: "Avoided Environmental Challenges:",
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
      avoidedChallenges: "Vermeden Milieu Uitdagingen:",
      collected: "Verzameld"
    }
  };

  const t = translations[selectedLanguage];

  // Game objects
  const gameRef = useRef({
    dino: { x: 50, y: 200, width: 45, height: 45, velocityY: 0, isJumping: false, jumpCount: 0 },
    collectibles: [] as Array<{ x: number; y: number; width: number; height: number; type: string; name: string; isCollectible: boolean }>,
    clouds: [] as Array<{ x: number; y: number; speed: number; size: number }>,
    gameSpeed: 2,
    score: 0,
    hits: 0,
    gameRunning: false,
    lastSpawnTime: 0
  });

  // Updated collectible types with all positive environmental icons
  const collectibleTypes = [
    // Original collectibles (minus Clean Energy Monitor)
    { type: '/lovable-uploads/5d2bd614-4b17-4d01-9a71-ccb46a3c48bf.png', name: 'Earth with Plant', isCollectible: true },
    { type: '/lovable-uploads/661772a0-df0b-44c6-835d-e70dea731378.png', name: 'Growing Plant', isCollectible: true },
    // New positive icons with updated names
    { type: '/lovable-uploads/fdf1020c-e08d-4792-861b-25357994cacb.png', name: 'Recycling Symbol', isCollectible: true },
    { type: '/lovable-uploads/9ebe3ed1-146a-48a1-b10f-ae05e19fc0d2.png', name: 'Recycling Facility', isCollectible: true },
    { type: '/lovable-uploads/721167ab-50cc-4d95-8bfe-77c33abc2d15.png', name: 'Waste Sorting', isCollectible: true },
    { type: '/lovable-uploads/0178c8ca-ee9f-457e-b478-b15b231207ca.png', name: 'Wind Turbines', isCollectible: true },
    { type: '/lovable-uploads/625faf06-2454-4fdb-ad43-140d17feb034.png', name: 'Green City', isCollectible: true },
    { type: '/lovable-uploads/834a2fa7-33e5-4eb0-84c8-4fa12b573d80.png', name: 'Electric Car', isCollectible: true },
    { type: '/lovable-uploads/250e79f0-7be1-4fba-90d9-161a0ad7c425.png', name: 'Forest Trees', isCollectible: true },
    { type: '/lovable-uploads/7d3d43b4-a80f-4c33-9ebe-56170096dfb5.png', name: 'Earth Care', isCollectible: true },
    { type: '/lovable-uploads/18cd6e74-a8dd-4977-a2bf-c0b3bb7a92d7.png', name: 'Bottle Recycling', isCollectible: true },
    // Two new positive icons
    { type: '/lovable-uploads/45a325a8-4bef-4345-8822-16c4b8d0572d.png', name: 'Solar Panel', isCollectible: true },
    { type: '/lovable-uploads/b399f0b5-4a11-468a-ba96-7938eaf442b9.png', name: 'Green Innovation', isCollectible: true }
  ];

  const obstacleTypes = [
    // Original obstacles
    { type: '/lovable-uploads/e74137ed-ec1b-40fa-90da-b45911ca4bb1.png', name: 'Volcano Pollution', isCollectible: false },
    { type: '/lovable-uploads/56cf7f85-b5d9-49b0-9a71-70cc5c28a059.png', name: 'Acid Rain', isCollectible: false },
    { type: '/lovable-uploads/fbd8c804-0bf1-4502-a2e6-05bddbb62f3e.png', name: 'CO2 Emissions', isCollectible: false },
    { type: '/lovable-uploads/0b899ce6-89d1-4540-9e32-086490877bc9.png', name: 'Industrial Pollution', isCollectible: false },
    { type: '/lovable-uploads/04a038af-ac30-41dc-8b7e-7da7201ab4a1.png', name: 'Burning Earth', isCollectible: false },
    { type: '/lovable-uploads/8489cb68-0478-4883-bb7d-4fbaac95936d.png', name: 'Melting Ice', isCollectible: false },
    // New negative obstacles
    { type: '/lovable-uploads/2adcbd84-6a6e-4d91-ba66-6ee1629cab8c.png', name: 'Building Explosion', isCollectible: false },
    { type: '/lovable-uploads/f850b845-c7ef-41c1-b3ba-f843d237eb75.png', name: 'Water Pollution', isCollectible: false },
    { type: '/lovable-uploads/e9f971d5-39d5-4c15-812c-5318d41f156e.png', name: 'Landfill Waste', isCollectible: false },
    { type: '/lovable-uploads/6e1995d3-e7c1-45b4-86db-b28a327e0430.png', name: 'CO2 Cloud', isCollectible: false },
    { type: '/lovable-uploads/c25ec259-9f11-4e21-8f21-a0dead0a5081.png', name: 'Polluting Car', isCollectible: false },
    { type: '/lovable-uploads/b138b94d-e66b-435a-b25b-85c2a5eaf396.png', name: 'Volcanic Eruption', isCollectible: false },
    { type: '/lovable-uploads/1b4bf97e-256a-4404-8f4c-cc9e2844a9ad.png', name: 'Dead Tree', isCollectible: false },
    { type: '/lovable-uploads/2f885168-c28e-4b54-a786-61e5c153ed91.png', name: 'Earth on Fire', isCollectible: false },
    { type: '/lovable-uploads/80707763-0cfa-43ec-b601-65d3402a36b8.png', name: 'Global Warming', isCollectible: false }
  ];

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const allItems = [...collectibleTypes, ...obstacleTypes];
      const imagePromises = allItems.map(item => {
        return new Promise<{key: string, img: HTMLImageElement}>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ key: item.type, img });
          img.onerror = reject;
          img.src = item.type;
        });
      });

      try {
        const results = await Promise.all(imagePromises);
        const imageMap: {[key: string]: HTMLImageElement} = {};
        results.forEach(({ key, img }) => {
          imageMap[key] = img;
        });
        setLoadedImages(imageMap);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    loadImages();
  }, []);

  const addPointsAnimation = useCallback((points: string, x: number, y: number, color: string) => {
    const id = Date.now() + Math.random();
    setPointsAnimations(prev => [...prev, { id, points, x, y, color }]);
    setTimeout(() => {
      setPointsAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 1500);
  }, []);

  const checkItemOverlap = useCallback((newX: number, newY: number, newWidth: number, newHeight: number) => {
    const game = gameRef.current;
    const minDistance = 80;
    
    return game.collectibles.some(item => {
      const distance = Math.sqrt(
        Math.pow(newX - item.x, 2) + Math.pow(newY - item.y, 2)
      );
      return distance < minDistance;
    });
  }, []);

  const resetGame = useCallback(() => {
    const game = gameRef.current;
    game.dino = { x: 50, y: 200, width: 45, height: 45, velocityY: 0, isJumping: false, jumpCount: 0 };
    game.collectibles = [];
    game.clouds = [
      { x: 200, y: 50, speed: 0.5, size: 40 },
      { x: 500, y: 80, speed: 0.3, size: 50 },
      { x: 700, y: 40, speed: 0.7, size: 35 }
    ];
    game.gameSpeed = 2;
    game.score = 0;
    game.hits = 0;
    game.gameRunning = true;
    game.lastSpawnTime = 0;
    setScore(0);
    setHits(0);
    setGameState('playing');
    setInventory([]);
    setAvoidedChallenges([]);
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
    game.dino.velocityY += 0.8;
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

    // Draw dino using T-Rex emoji - made bigger
    ctx.save();
    ctx.font = '50px Arial'; // Increased from 35px to 50px
    ctx.scale(-1, 1);
    ctx.fillText('🦖', -game.dino.x - 50, game.dino.y + 35); // Adjusted positioning for bigger size
    ctx.restore();

    // Spawn items with proper spacing and timing - now with even bigger icons
    if (currentTime - game.lastSpawnTime > 1000 && Math.random() < 0.02) {
      const allItems = [...collectibleTypes, ...obstacleTypes];
      const itemType = allItems[Math.floor(Math.random() * allItems.length)];
      const newX = canvas.width;
      const newY = itemType.isCollectible ? 175 : 180; // Adjusted for bigger icons
      const newWidth = 70; // Increased from 50 to 70
      const newHeight = 70; // Increased from 50 to 70
      
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

    // Update and draw items using images
    game.collectibles = game.collectibles.filter(item => {
      item.x -= game.gameSpeed;

      // Draw item using loaded image
      const img = loadedImages[item.type];
      if (img) {
        ctx.drawImage(img, item.x, item.y, item.width, item.height);
      } else {
        // Fallback to text if image not loaded
        ctx.font = '50px Arial'; // Increased font size for bigger fallback
        ctx.fillText('?', item.x, item.y + 40);
      }

      // Collision detection with adjusted hitboxes for bigger icons
      const dinoHitbox = {
        x: game.dino.x + 8,
        y: game.dino.y + 8,
        width: game.dino.width - 16,
        height: game.dino.height - 16
      };

      const itemHitbox = {
        x: item.x + (item.isCollectible ? 8 : 12),
        y: item.y + (item.isCollectible ? 8 : 12),
        width: item.width - (item.isCollectible ? 16 : 24),
        height: item.height - (item.isCollectible ? 16 : 24)
      };

      if (
        dinoHitbox.x < itemHitbox.x + itemHitbox.width &&
        dinoHitbox.x + dinoHitbox.width > itemHitbox.x &&
        dinoHitbox.y < itemHitbox.y + itemHitbox.height &&
        dinoHitbox.y + dinoHitbox.height > itemHitbox.y
      ) {
        if (item.isCollectible) {
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

      // Check if obstacle was successfully avoided (went off screen without collision)
      if (item.x < -item.width) {
        if (!item.isCollectible) {
          setAvoidedChallenges(prev => {
            const existing = prev.find(avoided => avoided.type === item.type);
            if (!existing) {
              return [...prev, { type: item.type, name: item.name }];
            }
            return prev;
          });
        }
        return false;
      }

      return true;
    });

    if (game.gameRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [addPointsAnimation, checkItemOverlap, loadedImages]);

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
    onGameComplete('154');
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
              <div className="text-4xl font-bold text-green-600 font-mono">154</div>
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
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border flex items-center gap-2">
                    {loadedImages[item.type] && (
                      <img src={item.type} alt={item.name} className="w-6 h-6" />
                    )}
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {avoidedChallenges.length > 0 && (
            <div className="mb-4 p-4 bg-blue-100 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">{t.avoidedChallenges}</h3>
              <div className="flex flex-wrap gap-2">
                {avoidedChallenges.map((item, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border flex items-center gap-2">
                    {loadedImages[item.type] && (
                      <img src={item.type} alt={item.name} className="w-6 h-6" />
                    )}
                    {item.name}
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
            
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
              <div className="text-xs space-y-1 text-gray-700 font-medium">
                <div>{t.score}: {score}</div>
                <div>{t.hits}: {hits}/3</div>
                <div>{t.gamesLeft}: {3 - gamesPlayed}</div>
              </div>
            </div>
            
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
