import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import { Zap, Shield, Smartphone } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-fade-up">
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Build Something Amazing
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto animate-fade-up">
            Create beautiful, responsive web applications with our modern platform.
            Start building your next great idea today.
          </p>
          <div className="mt-10 animate-fade-up">
            <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-opacity">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 reveal">
            Amazing Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Lightning Fast"
              description="Built for speed and performance, ensuring your applications run smoothly."
              Icon={Zap}
            />
            <FeatureCard
              title="Secure by Default"
              description="Enterprise-grade security features to protect your data and users."
              Icon={Shield}
            />
            <FeatureCard
              title="Mobile Ready"
              description="Responsive design that works perfectly on all devices and screens."
              Icon={Smartphone}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 reveal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of developers building amazing applications
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-opacity">
            Start Building
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;