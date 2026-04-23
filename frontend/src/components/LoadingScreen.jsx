import './LoadingScreen.css';

const LoadingScreen = ({ message = "Loading UNIcollab..." }) => {
  return (
    <div className="loading-container">
      {/* Blurred Background with Image */}
      <div className="loading-bg-overlay"></div>
      
      <div className="loading-content">
        {/* Animated Spinner with Gradient */}
        <div className="spinner-wrapper">
          <div className="premium-spinner"></div>
          <div className="logo-inner">🎓</div>
        </div>

        {/* Text Animations */}
        <div className="text-wrapper">
          <h1 className="brand-name">UNI<span className="gradient-pop">collab</span></h1>
          <p className="tagline">Your Gateway to Academic Success</p>
          
          <div className="progress-bar-container">
            <div className="progress-bar-glow"></div>
          </div>
          
          <p className="loading-msg">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
