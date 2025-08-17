import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RotateCcw, Trophy, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DinoGameProps {
  onGameComplete: () => void;
  onBack: () => void;
  selectedLanguage: 'en' | 'nl';
}

interface ScoreEntry {
  nickname: string;
  score: number;
  timestamp: number;
}

const DinoGame: React.FC<DinoGameProps> = ({ onGameComplete, onBack, selectedLanguage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'nickname' | 'playing' | 'gameOver' | 'waiting'>('nickname');
  const [nickname, setNickname] = useState('');
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gameScores, setGameScores] = useState<number[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [globalScores, setGlobalScores] = useState<ScoreEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [inventory, setInventory] = useState<Array<{type: string, name: string}>>([]);
  const [avoidedChallenges, setAvoidedChallenges] = useState<Array<{type: string, name: string}>>([]);
  const [pointsAnimations, setPointsAnimations] = useState<Array<{id: number, points: string, x: number, y: number, color: string}>>([]);
  const [loadedImages, setLoadedImages] = useState<{[key: string]: HTMLImageElement}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sound effects
  const soundsRef = useRef<{
    jump: () => void;
    collect: () => void;
    hit: () => void;
  }>({
    jump: () => {},
    collect: () => {},
    hit: () => {}
  });

  // Initialize sound effects
  useEffect(() => {
    // Create simple sound effects using Web Audio API
    const createBeepSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      return () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = type;
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
          console.log('Audio not supported:', error);
        }
      };
    };

    // Assign sound functions
    soundsRef.current = {
      jump: createBeepSound(400, 0.2, 'square'),
      collect: createBeepSound(600, 0.3, 'sine'),
      hit: createBeepSound(200, 0.5, 'sawtooth')
    };
  }, []);

  const translations = {
    en: {
      title: "Sustainable Dino Game",
      nicknamePrompt: "Enter your nickname to join the global scoreboard:",
      nicknamePlaceholder: "Your nickname",
      joinScoreboard: "Join Scoreboard",
      instructions: "Look at the icons! Jump from the negative environmental impacts and challenges! But go ahead and collect the positive environmental solutions!",
      spaceInstructions: "Use SPACE key or click the game area to jump! Double jump available!",
      start: "Start Game",
      restart: "Restart Game",
      tryAgain: "Try Again",
      gameOver: "Game Over!",
      score: "Score",
      hits: "Hits",
      gamesLeft: "Games left",
      completed: "Well done! You've completed all 3 games!",
      back: "Back to Instructions",
      inventory: "Collected Items:",
      avoidedChallenges: "Avoided Environmental Challenges:",
      collected: "Collected",
      globalScoreboard: "Global Scoreboard",
      yourRank: "Your Rank",
      viewScoreboard: "View Global Scoreboard",
      backToGame: "Back to Game",
      rank: "Rank",
      player: "Player",
      finalScore: "Final Score",
      highestGameScore: "Highest Game Score",
      continue: "Continue",
      submittingScore: "Submitting score..."
    },
    nl: {
      title: "Duurzame Dino Spel",
      nicknamePrompt: "Voer je bijnaam in om mee te doen aan het wereldwijde scorebord:",
      nicknamePlaceholder: "Je bijnaam",
      joinScoreboard: "Doe Mee aan Scorebord",
      instructions: "Kijk naar de iconen! Spring weg van de negatieve milieu-impacts en uitdagingen! Maar ga ervoor en verzamel de positieve milieu-oplossingen!",
      spaceInstructions: "Gebruik de SPATIE toets of klik op het speelveld om te springen! Dubbel springen mogelijk!",
      start: "Start Spel",
      restart: "Herstart Spel",
      tryAgain: "Probeer Opnieuw",
      gameOver: "Game Over!",
      score: "Score",
      hits: "Treffers",
      gamesLeft: "Spellen over",
      completed: "Goed gedaan! Je hebt alle 3 spellen voltooid!",
      back: "Terug naar Instructies",
      inventory: "Verzamelde Items:",
      avoidedChallenges: "Vermeden Milieu Uitdagingen:",
      collected: "Verzameld",
      globalScoreboard: "Wereldwijd Scorebord",
      yourRank: "Je Positie",
      viewScoreboard: "Bekijk Wereldwijd Scorebord",
      backToGame: "Terug naar Spel",
      rank: "Positie",
      player: "Speler",
      finalScore: "EindScore",
      highestGameScore: "Hoogste Spel Score",
      continue: "Doorgaan",
      submittingScore: "Score indienen..."
    }
  };

  const t = translations[selectedLanguage];

  // Helper function to get correct image path for production
  const getImagePath = useCallback((imagePath: string) => {
    const basePath = import.meta.env.MODE === 'production' ? '/green-escape-adventure-kids' : '';
    return `${basePath}${imagePath}`;
  }, []);

  // Game objects
  const gameRef = useRef({
    dino: { x: 50, y: 200, width: 50, height: 50, velocityY: 0, isJumping: false, jumpCount: 0 },
    collectibles: [] as Array<{ x: number; y: number; width: number; height: number; type: string; name: string; isCollectible: boolean }>,
    clouds: [] as Array<{ x: number; y: number; speed: number; size: number }>,
    gameSpeed: 2,
    score: 0,
    hits: 0,
    gameRunning: false,
    lastSpawnTime: 0
  });

  const collectibleTypes = [
    { type: '/lovable-uploads/5d2bd614-4b17-4d01-9a71-ccb46a3c48bf.png', name: 'Climate Solutions', isCollectible: true },
    { type: '/lovable-uploads/661772a0-df0b-44c6-835d-e70dea731378.png', name: 'Re-forestation', isCollectible: true },
    { type: '/lovable-uploads/fdf1020c-e08d-4792-861b-25357994cacb.png', name: 'Recycling', isCollectible: true },
    { type: '/lovable-uploads/9ebe3ed1-146a-48a1-b10f-ae05e19fc0d2.png', name: 'Recycling Facility', isCollectible: true },
    { type: '/lovable-uploads/721167ab-50cc-4d95-8bfe-77c33abc2d15.png', name: 'Waste Sorting', isCollectible: true },
    { type: '/lovable-uploads/0178c8ca-ee9f-457e-b478-b15b231207ca.png', name: 'Wind Turbines', isCollectible: true },
    { type: '/lovable-uploads/625faf06-2454-4fdb-ad43-140d17feb034.png', name: 'Green City', isCollectible: true },
    { type: '/lovable-uploads/834a2fa7-33e5-4eb0-84c8-4fa12b573d80.png', name: 'Electric Car', isCollectible: true },
    { type: '/lovable-uploads/250e79f0-7be1-4fba-90d9-161a0ad7c425.png', name: 'Forest Trees', isCollectible: true },
    { type: '/lovable-uploads/7d3d43b4-a80f-4c33-9ebe-56170096dfb5.png', name: 'Mother Earth', isCollectible: true },
    { type: '/lovable-uploads/18cd6e74-a8dd-4977-a2bf-c0b3bb7a92d7.png', name: 'Plastic Recycling', isCollectible: true },
    { type: '/lovable-uploads/45a325a8-4bef-4345-8822-16c4b8d0572d.png', name: 'Solar Panels', isCollectible: true },
    { type: '/lovable-uploads/b399f0b5-4a11-468a-ba96-7938eaf442b9.png', name: 'Green Innovation', isCollectible: true }
  ];

  const obstacleTypes = [
    { type: '/lovable-uploads/e74137ed-ec1b-40fa-90da-b45911ca4bb1.png', name: 'Natural Hazards', isCollectible: false },
    { type: '/lovable-uploads/56cf7f85-b5d9-49b0-9a71-70cc5c28a059.png', name: 'Acid Rain', isCollectible: false },
    { type: '/lovable-uploads/fbd8c804-0bf1-4502-a2e6-05bddbb62f3e.png', name: 'Ozone Depletion', isCollectible: false },
    { type: '/lovable-uploads/0b899ce6-89d1-4540-9e32-086490877bc9.png', name: 'Industrial Pollution', isCollectible: false },
    { type: '/lovable-uploads/04a038af-ac30-41dc-8b7e-7da7201ab4a1.png', name: 'Rising Average Temperature', isCollectible: false },
    { type: '/lovable-uploads/8489cb68-0478-4883-bb7d-4fbaac95936d.png', name: 'Melting Ice', isCollectible: false },
    { type: '/lovable-uploads/2adcbd84-6a6e-4d91-ba66-6ee1629cab8c.png', name: 'Building Demolition', isCollectible: false },
    { type: '/lovable-uploads/f850b845-c7ef-41c1-b3ba-f843d237eb75.png', name: 'Water Pollution', isCollectible: false },
    { type: '/lovable-uploads/e9f971d5-39d5-4c15-812c-5318d41f156e.png', name: 'Landfill Waste', isCollectible: false },
    { type: '/lovable-uploads/6e1995d3-e7c1-45b4-86db-b28a327e0430.png', name: 'Carbon Emission', isCollectible: false },
    { type: '/lovable-uploads/c25ec259-9f11-4e21-8f21-a0dead0a5081.png', name: 'Pollution', isCollectible: false },
    { type: '/lovable-uploads/b138b94d-e66b-435a-b25b-85c2a5eaf396.png', name: 'Volcanic Eruption', isCollectible: false },
    { type: '/lovable-uploads/1b4bf97e-256a-4404-8f4c-cc9e2844a9ad.png', name: 'Drought', isCollectible: false },
    { type: '/lovable-uploads/80707763-0cfa-43ec-b601-65d3402a36b8.png', name: 'Global Warming', isCollectible: false }
  ];

  // Load global scores from Supabase
  const loadGlobalScores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('highest_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading global scores:', error);
        return;
      }

      const scores = data.map(entry => ({
        nickname: entry.nickname,
        score: entry.highest_score,
        timestamp: new Date(entry.created_at).getTime()
      }));

      setGlobalScores(scores);
    } catch (error) {
      console.error('Error loading global scores:', error);
    }
  }, []);

  useEffect(() => {
    loadGlobalScores();
  }, [loadGlobalScores]);

  // Calculate final score
  const calculateFinalScore = useCallback(() => {
    const inventoryScore = inventory.length * 100;
    const avoidedScore = avoidedChallenges.length * 50;
    const completionBonus = 200;
    return inventoryScore + avoidedScore + completionBonus;
  }, [inventory, avoidedChallenges]);

  // Get highest individual game score
  const getHighestGameScore = useCallback(() => {
    return gameScores.length > 0 ? Math.max(...gameScores) : 0;
  }, [gameScores]);

  // Save score to Supabase
  const saveToSupabase = useCallback(async () => {
    if (!nickname.trim()) return;

    setIsSubmitting(true);
    try {
      const finalScore = calculateFinalScore();
      const highestGameScore = getHighestGameScore();
      const scoreToSave = Math.max(finalScore, highestGameScore);

      const { error } = await supabase
        .from('leaderboard')
        .insert({
          nickname: nickname.trim(),
          highest_score: scoreToSave,
          games_played: 3
        });

      if (error) {
        console.error('Error saving score:', error);
        return;
      }

      // Reload global scores to get updated leaderboard
      await loadGlobalScores();

      // Find user's rank
      const rank = globalScores.findIndex(entry => 
        entry.nickname === nickname && entry.score === scoreToSave
      ) + 1;
      setUserRank(rank);

    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [nickname, calculateFinalScore, getHighestGameScore, loadGlobalScores, globalScores]);

  const handleNicknameSubmit = () => {
    if (nickname.trim()) {
      setGameState('waiting');
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      const allItems = [...collectibleTypes, ...obstacleTypes];
      console.log('Loading images for', allItems.length, 'items');
      
      const imagePromises = allItems.map(item => {
        return new Promise<{key: string, img: HTMLImageElement}>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            console.log('Successfully loaded image:', item.type);
            resolve({ key: item.type, img });
          };
          img.onerror = (error) => {
            console.error('Failed to load image:', item.type, error);
            reject(error);
          };
          // Use the helper function to get correct path
          img.src = getImagePath(item.type);
        });
      });

      try {
        const results = await Promise.all(imagePromises);
        const imageMap: {[key: string]: HTMLImageElement} = {};
        results.forEach(({ key, img }) => {
          imageMap[key] = img;
        });
        console.log('All images loaded successfully:', Object.keys(imageMap).length);
        setLoadedImages(imageMap);
      } catch (error) {
        console.error('Failed to load some images:', error);
      }
    };

    loadImages();
  }, [getImagePath]);

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
    game.dino = { x: 50, y: 200, width: 50, height: 50, velocityY: 0, isJumping: false, jumpCount: 0 };
    game.collectibles = [];
    game.clouds = [
      { x: 200, y: 50, speed: 0.5, size: 40 },
      { x: 500, y: 80, speed: 0.3, size: 50 },
      { x: 800, y: 40, speed: 0.7, size: 35 },
      { x: 1000, y: 60, speed: 0.4, size: 45 }
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
      
      // Play jump sound
      soundsRef.current.jump();
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.clouds.forEach((cloud, index) => {
      cloud.x -= cloud.speed;
      if (cloud.x < -cloud.size) {
        cloud.x = canvas.width + cloud.size;
        const otherClouds = game.clouds.filter((_, i) => i !== index);
        while (otherClouds.some(other => Math.abs(cloud.x - other.x) < 150)) {
          cloud.x += 50;
        }
      }
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = `${cloud.size}px Arial`;
      ctx.fillText('☁️', cloud.x, cloud.y);
    });

    game.dino.velocityY += 0.8;
    game.dino.y += game.dino.velocityY;

    if (game.dino.y >= 200) {
      game.dino.y = 200;
      game.dino.velocityY = 0;
      game.dino.isJumping = false;
      game.dino.jumpCount = 0;
    }

    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, 235, canvas.width, 15);

    ctx.save();
    ctx.font = '55px Arial';
    ctx.scale(-1, 1);
    ctx.fillText('🦖', -game.dino.x - 55, game.dino.y + 40);
    ctx.restore();

    if (currentTime - game.lastSpawnTime > 1000 && Math.random() < 0.02) {
      const allItems = [...collectibleTypes, ...obstacleTypes];
      const itemType = allItems[Math.floor(Math.random() * allItems.length)];
      const newX = canvas.width;
      const newY = itemType.isCollectible ? 175 : 180;
      const newWidth = 70;
      const newHeight = 70;
      
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

    game.collectibles = game.collectibles.filter(item => {
      item.x -= game.gameSpeed;

      const img = loadedImages[item.type];
      if (img) {
        ctx.drawImage(img, item.x, item.y, item.width, item.height);
      } else {
        ctx.fillStyle = item.isCollectible ? '#22c55e' : '#ef4444';
        ctx.fillRect(item.x, item.y, item.width, item.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          item.isCollectible ? '♻️' : '💨', 
          item.x + item.width/2, 
          item.y + item.height/2 + 10
        );
        ctx.textAlign = 'left';
        
        console.log('Image not loaded for:', item.type, 'Using fallback display');
      }

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
          
          // Play collect sound
          soundsRef.current.collect();
          
          return false;
        } else {
          game.hits += 1;
          game.score = Math.max(0, game.score - 100);
          setScore(game.score);
          setHits(game.hits);
          addPointsAnimation('-100', item.x, item.y, '#ef4444');
          
          // Play hit sound
          soundsRef.current.hit();
          
          if (game.hits >= 3) {
            game.gameRunning = false;
            setGameState('gameOver');
          }
          return false;
        }
      }

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

  const handleRestart = async () => {
    if (gamesPlayed < 2) {
      setGameScores(prev => [...prev, score]);
      setGamesPlayed(prev => prev + 1);
      resetGame();
    } else {
      setGameScores(prev => [...prev, score]);
      setGamesPlayed(3);
      await saveToSupabase();
      onGameComplete();
    }
  };

  const handleViewScoreboard = () => {
    setShowScoreboard(true);
  };

  const handleBackToGame = () => {
    setShowScoreboard(false);
  };

  // Nickname input screen
  if (gameState === 'nickname') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
            <p className="text-gray-600">{t.nicknamePrompt}</p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t.nicknamePlaceholder}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                  className="flex-1"
                  maxLength={20}
                />
              </div>
              
              <Button 
                onClick={handleNicknameSubmit}
                disabled={!nickname.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
              >
                <Trophy className="mr-2 h-4 w-4" />
                {t.joinScoreboard}
              </Button>
            </div>
            
            <Button 
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scoreboard screen
  if (showScoreboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800">{t.globalScoreboard}</h2>
              {userRank > 0 && (
                <p className="text-lg text-green-600 font-semibold mt-2">
                  {t.yourRank}: #{userRank}
                </p>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {globalScores.slice(0, 10).map((entry, index) => (
                <div 
                  key={`${entry.nickname}-${entry.timestamp}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.nickname === nickname ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg w-8">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="font-medium">{entry.nickname}</span>
                  </div>
                  <span className="font-bold text-green-600">{entry.score}</span>
                </div>
              ))}
              
              {globalScores.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No scores yet. Be the first to play!
                </div>
              )}
            </div>
            
            <div className="text-center mt-6 space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                  {t.finalScore}: {calculateFinalScore()}
                </p>
                <p className="text-sm text-blue-600 font-semibold">
                  {t.highestGameScore}: {getHighestGameScore()}
                </p>
              </div>
              <Button 
                onClick={handleBackToGame}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
              >
                {t.backToGame}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-4">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-6xl mx-auto relative">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-gray-600 mb-2">{t.instructions}</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">{t.spaceInstructions}</p>
            <p className="text-sm text-purple-600 font-medium">Playing as: {nickname}</p>
          </div>

          {inventory.length > 0 && (
            <div className="mb-4 p-4 bg-green-100 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">{t.inventory}</h3>
              <div className="flex flex-wrap gap-2">
                {inventory.map((item, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border flex items-center gap-2">
                    <img 
                      src={getImagePath(item.type)} 
                      alt={item.name} 
                      className="w-6 h-6"
                      onError={(e) => {
                        console.log('Image failed to load in inventory:', item.type);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
                    <img 
                      src={getImagePath(item.type)} 
                      alt={item.name} 
                      className="w-6 h-6"
                      onError={(e) => {
                        console.log('Image failed to load in avoided challenges:', item.type);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mb-6 relative">
            <canvas
              ref={canvasRef}
              width={1200}
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
                    left: `${(anim.x / 1200) * 100}%`,
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
              <div className="space-y-3">
                <Button 
                  onClick={restartCurrentGame}
                  variant="outline"
                  className="mx-2"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.restart}
                </Button>
                
                <Button 
                  onClick={handleViewScoreboard}
                  variant="outline"
                  className="mx-2"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  {t.viewScoreboard}
                </Button>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="space-y-3">
                <p className="text-xl font-bold text-red-600">{t.gameOver}</p>
                <p className="text-gray-600">{t.score}: {score}</p>
                <p className="text-gray-600">{t.hits}: {hits}/3</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {gamesPlayed < 2 ? (
                    <Button 
                      onClick={handleRestart}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-3"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t.tryAgain} ({2 - gamesPlayed} {t.gamesLeft})
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleRestart}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-3"
                    >
                      {isSubmitting ? t.submittingScore : `${t.completed} & ${t.continue}`}
                    </Button>
                  )}
                  <Button 
                    onClick={restartCurrentGame}
                    variant="outline"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t.restart}
                  </Button>
                  <Button 
                    onClick={handleViewScoreboard}
                    variant="outline"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    {t.viewScoreboard}
                  </Button>
                </div>
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
