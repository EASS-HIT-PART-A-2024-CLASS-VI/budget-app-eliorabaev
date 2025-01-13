import React from "react";
import { useNavigate } from "react-router-dom";
import "../static/css/Header.css";
import logo from "../static/images/logo_clean.png";

const Header = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    const handleAboutClick = () => {
        navigate("/about"); // Navigate to the About Me page
    };

    const handleLogoClick = () => {
        navigate("/"); // Navigate to the home page
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    <span className="logo" onClick={handleLogoClick}>
                        <img className="logo-image" src={logo} alt="Budget app logo" />
                    </span>
                </div>
                <nav>
                    <ul>
                        <li>
                            <span className="nav-link" onClick={handleAboutClick}>
                                About Me
                            </span>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
