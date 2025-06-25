
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Trophy, Leaf, Recycle, TreePine, Droplets } from "lucide-react";
import DinoGame from "@/components/DinoGame";
import Footer from "@/components/Footer";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');

  if (currentView === 'game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
        <div className="flex-1">
          <DinoGame />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
              🌱 Educational Adventure
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Green Escape: Return from the Future
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Help the time-traveling researcher escape from his malfunctioning time machine and save our planet! 
              An exciting escape room adventure that teaches kids about environmental conservation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                onClick={() => setCurrentView('game')}
              >
                🚀 Start Adventure
              </Button>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>Ages 8-12</span>
                <Clock className="w-5 h-5 ml-4" />
                <span>45-60 minutes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-white/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              What Makes This Adventure Special?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Learn & Play</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Discover environmental facts while solving exciting puzzles and challenges.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Recycle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Eco-Friendly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Learn about recycling, renewable energy, and protecting our planet's future.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Achievement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Earn badges and complete challenges as you progress through the adventure.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Interactive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Engage with interactive elements, mini-games, and immersive storytelling.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-none">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-gray-900 mb-4">
                    🕰️ The Story Begins...
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Dr. Green, a brilliant environmental scientist, has traveled from the year 2124 to warn us about 
                    our planet's future. But his time machine has malfunctioned, trapping him in our era! 
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    He needs YOUR help to collect the scattered temporal energy crystals, solve environmental puzzles, 
                    and repair his machine before it's too late. Along the way, you'll learn secrets about protecting 
                    our planet and ensuring a green future for all!
                  </p>
                  <div className="flex justify-center gap-4 text-4xl">
                    <TreePine className="w-12 h-12 text-green-600" />
                    <Droplets className="w-12 h-12 text-blue-600" />
                    <Leaf className="w-12 h-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready for Your Green Adventure?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join Dr. Green on this exciting journey and become an environmental hero!
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => setCurrentView('game')}
            >
              🌟 Begin Your Mission
            </Button>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
