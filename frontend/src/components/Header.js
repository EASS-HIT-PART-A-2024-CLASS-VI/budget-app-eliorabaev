import React from 'react';
import { Link } from 'react-router-dom';
import '../static/css/Header.css';
import logo from '../static/images/logo_clean.png';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <a href="/" className="logo">
            <img className="logo-image" src={logo} alt="Budget app logo" />
          </a>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/about">About Me</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};


export default Header;
