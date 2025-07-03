
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, X, Calendar, Hash } from 'lucide-react';
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
  display_id: number;
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
      id: "ID",
      player: "Player",
      score: "Score",
      gamesPlayed: "Games",
      date: "Date",
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
      id: "ID",
      player: "Speler",
      score: "Score",
      gamesPlayed: "Spellen",
      date: "Datum",
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
        .limit(100);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(selectedLanguage === 'en' ? 'en-US' : 'nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-6xl w-full max-h-[90vh] overflow-hidden">
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
            <div className="overflow-y-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 font-bold">{t.rank}</TableHead>
                    <TableHead className="w-20 font-bold">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        {t.id}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold">{t.player}</TableHead>
                    <TableHead className="text-right font-bold">{t.score}</TableHead>
                    <TableHead className="text-center font-bold">{t.gamesPlayed}</TableHead>
                    <TableHead className="text-right font-bold">
                      <div className="flex items-center justify-end">
                        <Calendar className="h-4 w-4 mr-1" />
                        {t.date}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((entry, index) => (
                    <TableRow 
                      key={entry.id}
                      className={`${
                        index < 3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' 
                          : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <TableCell className="font-bold text-lg">
                        {getRankEmoji(index)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-500">
                        #{entry.display_id}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {entry.nickname}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600 text-lg">
                        {entry.highest_score.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-gray-600">
                        {entry.games_played}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {formatDate(entry.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && !error && scores.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {scores.length} players • Updated in real-time
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalLeaderboard;
