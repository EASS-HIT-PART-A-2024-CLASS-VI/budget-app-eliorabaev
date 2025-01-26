import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/css/Homepage.css';
import illustration from '../static/images/logo.png';

const HomePage = () => {
    const navigate = useNavigate();

    const handleTryNow = () => {
        navigate('/budget-steps');
    };

    const handleAboutClick = () => {
        navigate("/about"); // Navigate to the About Me page
    };


    return (
        <main className="homepage">
            <div className="content">
                <div className="left">
                    <h1>
                        It's time to <span className="highlight">make money</span> out of <span className="highlight">your money</span>.
                        <br />
                        <span>Try Budget App now!</span>
                    </h1>
                    <p className="diescrption">
                        Take control of your finances with Budget App.
                        <br />
                        Plan, save, and grow your money effortlessly <span className="highlight">using top-geared AI</span>.
                    </p>
                    <div className="buttons">
                        <button className="primary-button" onClick={handleTryNow}>
                            Try It Now For Free!
                        </button>
                        <button className="secondary-button" onClick={handleAboutClick}>About me</button>
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
