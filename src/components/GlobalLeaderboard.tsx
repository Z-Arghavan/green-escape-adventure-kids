
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  highest_score: number;
  games_played: number;
  created_at: string;
}

interface GlobalLeaderboardProps {
  selectedLanguage: 'en' | 'nl';
  onClose: () => void;
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ selectedLanguage, onClose }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Global Leaderboard",
      rank: "Rank",
      player: "Player",
      score: "Score",
      gamesPlayed: "Games Played",
      refresh: "Refresh",
      close: "Close",
      loading: "Loading scores...",
      error: "Failed to load scores",
      noScores: "No scores yet. Be the first to play!",
      position: "Position"
    },
    nl: {
      title: "Wereldwijd Scorebord",
      rank: "Positie",
      player: "Speler",
      score: "Score",
      gamesPlayed: "Spellen Gespeeld",
      refresh: "Vernieuwen",
      close: "Sluiten",
      loading: "Scores laden...",
      error: "Kon scores niet laden",
      noScores: "Nog geen scores. Wees de eerste die speelt!",
      position: "Positie"
    }
  };

  const t = translations[selectedLanguage];

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('highest_score', { ascending: false })
        .limit(50);

      if (supabaseError) {
        console.error('Error loading scores:', supabaseError);
        setError(t.error);
        return;
      }

      setScores(data || []);
    } catch (err) {
      console.error('Error loading scores:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              {t.title}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadScores}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
              {t.close}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadScores} className="mt-4">
                {t.refresh}
              </Button>
            </div>
          )}

          {!loading && !error && scores.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t.noScores}</p>
            </div>
          )}

          {!loading && !error && scores.length > 0 && (
            <div className="overflow-y-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">{t.rank}</TableHead>
                    <TableHead>{t.player}</TableHead>
                    <TableHead className="text-right">{t.score}</TableHead>
                    <TableHead className="text-right">{t.gamesPlayed}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((entry, index) => (
                    <TableRow 
                      key={entry.id}
                      className={index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
                    >
                      <TableCell className="font-bold text-lg">
                        {getRankEmoji(index)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.nickname}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {entry.highest_score}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {entry.games_played}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalLeaderboard;
