import React from 'react';
import '../static/css/Homepage.css';
import illustration from '../static/images/logo.png';

const HomePage = () => {
  return (
    <main className="homepage">
      <div className="content">
        <div className="left">
          <h1>
            It's time to make money out of your money.
            <br />
            <span className="highlight">Try Budget App now!</span>
          </h1>
          <p className="description">
            Take control of your finances with Budget App. Plan, save, and grow your money effortlessly.
          </p>
          <div className="buttons">
            <button className="primary-button">Get Started</button>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
        <div className="right">
          <img src={illustration} alt="Budget App Illustration" className="illustration" />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
