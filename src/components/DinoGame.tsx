
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DinoGameProps {
  onGameComplete: () => void;
  onBack: () => void;
  selectedLanguage: 'en' | 'nl';
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 200;
const DINO_START_X = 50;
const DINO_START_Y = CANVAS_HEIGHT - 30;
const DINO_WIDTH = 20;
const DINO_HEIGHT = 30;
const GRAVITY = 0.5;
const JUMP_SPEED = -10;
const OBSTACLE_SPEED = 5;
const OBSTACLE_SPAWN_RATE = 150;
const SCORE_INCREMENT = 10;

const DinoGame: React.FC<DinoGameProps> = ({ onGameComplete, onBack, selectedLanguage }) => {
  const [dinoY, setDinoY] = useState(DINO_START_Y);
  const [dinoYSpeed, setDinoYSpeed] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [currentGame, setCurrentGame] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [suggestedNickname, setSuggestedNickname] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const gameStateRef = useRef({
    dinoY: DINO_START_Y,
    dinoYSpeed: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    score: 0,
    gameRunning: false
  });

  const translations = {
    en: {
      title: "The Green Dino Game",
      pressSpace: "Press SPACE to jump",
      score: "Score",
      highScore: "High Score",
      gameOver: "Game Over!",
      restart: "Restart",
      backToMenu: "Back to Menu",
      gameComplete: "Game Complete!",
      yourScores: "Your Scores",
      game: "Game",
      highestScore: "Highest Score",
      enterNickname: "Enter Nickname",
      nickname: "Nickname",
      submitScore: "Submit Score",
      submitting: "Submitting...",
      nextGame: `Start Game ${currentGame + 1}`,
      finalScore: "Final Score",
    },
    nl: {
      title: "Het Groene Dino Spel",
      pressSpace: "Druk op SPATIE om te springen",
      score: "Score",
      highScore: "High Score",
      gameOver: "Game Over!",
      restart: "Opnieuw starten",
      backToMenu: "Terug naar Menu",
      gameComplete: "Spel Voltooid!",
      yourScores: "Jouw Scores",
      game: "Spel",
      highestScore: "Hoogste Score",
      enterNickname: "Voer Nickname In",
      nickname: "Nickname",
      submitScore: "Score Indienen",
      submitting: "Indienen...",
      nextGame: `Start Spel ${currentGame + 1}`,
      finalScore: "Eindscore",
    }
  };

  const t = translations[selectedLanguage];

  const resetGame = useCallback(() => {
    const newGameState = {
      dinoY: DINO_START_Y,
      dinoYSpeed: 0,
      isJumping: false,
      obstacles: [],
      score: 0,
      gameRunning: false
    };
    
    gameStateRef.current = newGameState;
    setDinoY(DINO_START_Y);
    setDinoYSpeed(0);
    setIsJumping(false);
    setObstacles([]);
    setScore(0);
    setGameRunning(false);
    setGameOver(false);
  }, []);

  const jump = useCallback(() => {
    if (!gameStateRef.current.isJumping && gameStateRef.current.gameRunning) {
      gameStateRef.current.isJumping = true;
      gameStateRef.current.dinoYSpeed = JUMP_SPEED;
      setIsJumping(true);
      setDinoYSpeed(JUMP_SPEED);
    }
  }, []);

  const endGame = useCallback(() => {
    gameStateRef.current.gameRunning = false;
    setGameRunning(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Dino
    ctx.fillStyle = 'green';
    ctx.fillRect(DINO_START_X, gameStateRef.current.dinoY, DINO_WIDTH, DINO_HEIGHT);

    // Draw Obstacles
    ctx.fillStyle = 'red';
    gameStateRef.current.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw Score
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText(`${t.score}: ${gameStateRef.current.score}`, 10, 20);
    ctx.fillText(`${t.highScore}: ${highScore}`, 10, 40);
  }, [t.score, t.highScore, highScore]);

  const checkCollisions = useCallback(() => {
    for (const obstacle of gameStateRef.current.obstacles) {
      if (
        DINO_START_X < obstacle.x + obstacle.width &&
        DINO_START_X + DINO_WIDTH > obstacle.x &&
        gameStateRef.current.dinoY < obstacle.y + obstacle.height &&
        gameStateRef.current.dinoY + DINO_HEIGHT > obstacle.y
      ) {
        endGame();
        return;
      }
    }
  }, [endGame]);

  const gameLoop = useCallback(() => {
    if (!gameStateRef.current.gameRunning) return;

    // Update Dino Physics
    const newY = gameStateRef.current.dinoY + gameStateRef.current.dinoYSpeed;
    if (newY < DINO_START_Y) {
      gameStateRef.current.dinoYSpeed += GRAVITY;
      gameStateRef.current.dinoY = newY;
      setDinoY(newY);
      setDinoYSpeed(gameStateRef.current.dinoYSpeed);
    } else {
      gameStateRef.current.dinoY = DINO_START_Y;
      gameStateRef.current.dinoYSpeed = 0;
      gameStateRef.current.isJumping = false;
      setDinoY(DINO_START_Y);
      setDinoYSpeed(0);
      setIsJumping(false);
    }

    // Update Obstacles
    gameStateRef.current.obstacles = gameStateRef.current.obstacles
      .map(obstacle => ({ ...obstacle, x: obstacle.x - obstacle.speed }))
      .filter(obstacle => obstacle.x + obstacle.width > 0);

    // Spawn new obstacles
    if (Math.random() * OBSTACLE_SPAWN_RATE < 1) {
      gameStateRef.current.obstacles.push({
        x: CANVAS_WIDTH,
        y: CANVAS_HEIGHT - 20,
        width: 20,
        height: 20,
        speed: OBSTACLE_SPEED,
      });
    }

    setObstacles([...gameStateRef.current.obstacles]);

    // Update Score
    gameStateRef.current.score += SCORE_INCREMENT;
    setScore(gameStateRef.current.score);
    setHighScore(Math.max(highScore, gameStateRef.current.score));

    // Check Collisions
    checkCollisions();

    // Draw
    draw();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [checkCollisions, draw, highScore]);

  const startGame = useCallback(() => {
    resetGame();
    gameStateRef.current.gameRunning = true;
    setGameRunning(true);
    setGameOver(false);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [resetGame, gameLoop]);

  const handleCanvasClick = useCallback(() => {
    if (gameRunning) {
      jump();
    } else if (!gameOver) {
      startGame();
    }
  }, [gameRunning, gameOver, jump, startGame]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (gameRunning) {
        jump();
      } else if (!gameOver) {
        startGame();
      }
    }
  }, [gameRunning, gameOver, jump, startGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [handleKeyDown]);

  const handleRestart = () => {
    startGame();
  };

  const handleNextGame = () => {
    setScores([...scores, score]);
    resetGame();

    if (currentGame < 3) {
      setCurrentGame(currentGame + 1);
      startGame();
    } else {
      setGameComplete(true);
      setGameRunning(false);
    }
  };

  const generateGreenSuggestion = (originalNickname: string): string => {
    const greenWords = ['Eco', 'Green', 'Leaf', 'Nature', 'Forest', 'Earth', 'Plant', 'Solar', 'Wind', 'Ocean'];
    const randomGreen = greenWords[Math.floor(Math.random() * greenWords.length)];
    return `${originalNickname}${randomGreen}`;
  };

  const submitScore = async () => {
    if (!nickname.trim()) return;
    
    setIsSubmittingScore(true);
    setNicknameError(null);
    setSuggestedNickname(null);
    
    try {
      const highestScore = Math.max(...scores);
      
      const { error } = await supabase
        .from('leaderboard')
        .insert({
          nickname: nickname.trim(),
          highest_score: highestScore,
          games_played: 3
        });

      if (error) {
        console.error('Error submitting score:', error);
        
        if (error.code === '23505' && error.message.includes('unique_nickname')) {
          const suggestion = generateGreenSuggestion(nickname.trim());
          setSuggestedNickname(suggestion);
          setNicknameError(`This nickname is already taken! How about "${suggestion}"?`);
        } else {
          setNicknameError('Failed to submit score. Please try again.');
        }
      } else {
        console.log('Score submitted successfully!');
        onGameComplete();
      }
    } catch (err) {
      console.error('Error submitting score:', err);
      setNicknameError('Failed to submit score. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const useSuggestedNickname = () => {
    if (suggestedNickname) {
      setNickname(suggestedNickname);
      setSuggestedNickname(null);
      setNicknameError(null);
    }
  };

  // Auto-start next game
  useEffect(() => {
    if (currentGame > 1 && !gameComplete) {
      const timer = setTimeout(() => {
        startGame();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentGame, gameComplete, startGame]);

  if (gameComplete) {
    const highestScore = Math.max(...scores);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {t.gameComplete}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-green-100 p-4 rounded-xl">
                <p className="text-lg font-semibold text-green-800">{t.yourScores}:</p>
                <div className="space-y-2 mt-2">
                  {scores.map((score, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{t.game} {index + 1}:</span>
                      <span className="font-bold text-green-600">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-100 p-4 rounded-xl">
                <p className="text-lg font-semibold text-yellow-800">
                  {t.highestScore}: <span className="text-2xl font-bold text-yellow-600">{highestScore}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.enterNickname}:
                </label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameError(null);
                    setSuggestedNickname(null);
                  }}
                  placeholder={t.nickname}
                  className="w-full"
                  maxLength={50}
                />
                {nicknameError && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-red-600">{nicknameError}</p>
                    {suggestedNickname && (
                      <Button
                        onClick={useSuggestedNickname}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        Use "{suggestedNickname}"
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={submitScore}
                disabled={!nickname.trim() || isSubmittingScore}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3"
              >
                {isSubmittingScore ? t.submitting : t.submitScore}
              </Button>
            </div>

            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToMenu}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            className="bg-gray-100 rounded-md shadow-md cursor-pointer w-full"
            style={{ maxWidth: '800px', height: 'auto' }}
          />
          {!gameRunning && !gameOver && (
            <div className="text-center text-gray-600">
              {t.pressSpace}
            </div>
          )}
          {gameOver && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-red-600">{t.gameOver}</div>
              {currentGame < 3 ? (
                <Button onClick={handleNextGame} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3">
                  {t.nextGame}
                </Button>
              ) : (
                <>
                  <div className="bg-yellow-100 p-4 rounded-xl">
                    <p className="text-lg font-semibold text-yellow-800">
                      {t.finalScore}: <span className="text-2xl font-bold text-yellow-600">{score}</span>
                    </p>
                  </div>
                  <Button onClick={handleRestart} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t.restart}
                  </Button>
                </>
              )}
            </div>
          )}
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.backToMenu}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DinoGame;
