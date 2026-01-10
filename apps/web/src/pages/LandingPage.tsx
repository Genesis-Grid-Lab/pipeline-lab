import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import {
  Image,
  Music,
  Box,
  Layers,
  Upload,
  FolderOpen,
  Search,
  History,
  Users,
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react';

const LandingPage = () => {

  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Easy Upload",
      description: "Drag and drop your sprites, textures, audio files, and 3D model references."
    },
    {
      icon: <FolderOpen className="w-6 h-6" />,
      title: "Smart Organization",
      description: "Create collections, add tags, and keep your assets organized for quick access."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Instant Search",
      description: "Find any asset instantly with powerful search and filter capabilities."
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Version Control",
      description: "Track changes and maintain version history for all your assets."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Ready",
      description: "Built for collaboration with your indie game dev team."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Pipeline",
      description: "Streamline your workflow and ship games faster."
    }
  ];

  const assetTypes = [
    { icon: <Image className="w-8 h-8" />, name: "Sprites", color: "text-green-500" },
    { icon: <Layers className="w-8 h-8" />, name: "Textures", color: "text-amber-500" },
    { icon: <Box className="w-8 h-8" />, name: "3D Models", color: "text-pink-500" },
    { icon: <Music className="w-8 h-8" />, name: "Audio", color: "text-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation*/}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-blue-300" fill="currentColor" aria-hidden="true">
                <circle cx="6" cy="12" r="3" />
                <circle cx="12" cy="6" r="3" />
                <circle cx="12" cy="18" r="3" />
                <circle cx="18" cy="12" r="3" />
              </svg>

            </div>
            <span className="font-bold text-xl">Pipeline Lab</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" >
              <Button variant="ghost" data-testid="login-nav-btn">Log In</Button>
            </Link>
            <Link to="/register">
              <Button data-testid="get-started-nav-btn">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero text-white pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Your Game Assets,
              <br />
              <span className="text-blue-200">Organized & Ready</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              The asset management platform built for indie game developers.
              Upload, organize, version, and access your sprites, textures, audio, and 3D models in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
                  data-testid="hero-get-started-btn"
                >
                  Start Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                  data-testid="hero-login-btn"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Asset Type Icons */}
          <div className="mt-16 flex justify-center gap-8 md:gap-16 animate-fadeInUp delay-200">
            {assetTypes.map((type, index) => (
              <div
                key={type.name}
                className="flex flex-col items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
              >
                <div className={`${type.color} bg-white/20 p-4 rounded-xl backdrop-blur-sm`}>
                  {type.icon}
                </div>
                <span className="text-sm font-medium text-blue-100">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50" data-testid="features-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Streamline your game development pipeline with powerful asset management tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-xl p-6 hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Built for Indie Devs</h2>
              <div className="space-y-4">
                {[
                  "Support for all common game asset formats",
                  "Version history to track changes over time",
                  "Tag-based organization for quick filtering",
                  "Fast search across all your assets",
                  "Secure cloud storage for your files",
                  "Clean, intuitive interface"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="inline-block mt-8">
                <Button size="lg" data-testid="benefits-cta-btn">
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1672754091891-b58ed53665e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMGdhbWUlMjBkZXZlbG9wZXIlMjB3b3JraW5nJTIwc2V0dXB8ZW58MHx8fHwxNzY3NzY0NDI2fDA&ixlib=rb-4.1.0&q=85"
                  alt="Indie game developer workspace"
                  className="rounded-xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Organize Your Assets?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join indie game developers who are streamlining their workflow with Asset Forge.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
              data-testid="cta-get-started-btn"
            >
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">

                <svg viewBox="0 0 24 24" className="w-16 h-16 text-blue-300" fill="currentColor" aria-hidden="true">
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="12" cy="6" r="3" />
                  <circle cx="12" cy="18" r="3" />
                  <circle cx="18" cy="12" r="3" />
                </svg>

              </div>
              <span className="font-bold text-white">Pipeline Lab</span>
            </div>
            <p className="text-sm">
              Built for indie game developers
            </p>
          </div>
        </div>
      </footer>
    </div >
  );
}

export default LandingPage;
