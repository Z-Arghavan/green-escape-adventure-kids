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
const OBSTACLE_SPAWN_RATE = 150; // Lower number = more frequent
const SCORE_INCREMENT = 10;

const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

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

  const resetGame = () => {
    setDinoY(DINO_START_Y);
    setDinoYSpeed(0);
    setIsJumping(false);
    setObstacles([]);
    setScore(0);
    setGameRunning(false);
    setGameOver(false);
  };

  const startGame = () => {
    resetGame();
    setGameRunning(true);
    setGameOver(false);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    setGameRunning(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameRef.current);
  };

  const jump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setDinoYSpeed(JUMP_SPEED);
    }
  };

  const updateDino = () => {
    setDinoY((prevDinoY) => {
      const newY = prevDinoY + dinoYSpeed;
      if (newY < DINO_START_Y) {
        setDinoYSpeed(dinoYSpeed + GRAVITY);
        return newY;
      } else {
        setIsJumping(false);
        setDinoYSpeed(0);
        return DINO_START_Y;
      }
    });
  };

  const updateObstacles = () => {
    setObstacles((prevObstacles) => {
      const newObstacles = prevObstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - obstacle.speed,
      }));

      const updatedObstacles = newObstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

      if (Math.random() * OBSTACLE_SPAWN_RATE < 1) {
        updatedObstacles.push({
          x: CANVAS_WIDTH,
          y: CANVAS_HEIGHT - 20,
          width: 20,
          height: 20,
          speed: OBSTACLE_SPEED,
        });
      }

      return updatedObstacles;
    });
  };

  const checkCollisions = () => {
    for (const obstacle of obstacles) {
      if (
        DINO_START_X < obstacle.x + obstacle.width &&
        DINO_START_X + DINO_WIDTH > obstacle.x &&
        dinoY < obstacle.y + obstacle.height &&
        dinoY + DINO_HEIGHT > obstacle.y
      ) {
        endGame();
        return;
      }
    }
  };

  const updateScore = () => {
    setScore((prevScore) => prevScore + SCORE_INCREMENT);
    setHighScore((prevHighScore) => Math.max(prevHighScore, score));
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Dino
    ctx.fillStyle = 'green';
    ctx.fillRect(DINO_START_X, dinoY, DINO_WIDTH, DINO_HEIGHT);

    // Draw Obstacles
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw Score
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText(`${t.score}: ${score}`, 10, 20);
    ctx.fillText(`${t.highScore}: ${highScore}`, 10, 40);
  };

  const gameLoop = () => {
    if (!gameRunning) return;

    updateDino();
    updateObstacles();
    checkCollisions();
    updateScore();
    draw();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const handleCanvasClick = () => {
    if (gameRunning) {
      jump();
    } else {
      startGame();
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (gameRunning) {
        jump();
      } else {
        startGame();
      }
    }
  }, [gameRunning, startGame, jump]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [handleKeyDown]);

  const handleRestart = () => {
    resetGame();
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
        
        // Check if it's a unique constraint violation
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

  useEffect(() => {
    if (currentGame > 1) {
      startGame();
    }
  }, [currentGame]);

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
            className="bg-gray-100 rounded-md shadow-md cursor-pointer"
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
