
import Navbar from '../components/Navbar';
import DebugTool from '../components/DebugTool';

const Debug = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 animate-fade-up">
            Terminology Debug Tool
          </h1>
          
          <DebugTool />
        </div>
      </div>
    </div>
  );
};

export default Debug;
