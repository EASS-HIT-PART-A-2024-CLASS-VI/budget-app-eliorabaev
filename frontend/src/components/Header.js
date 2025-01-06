import React from 'react';
import { Link } from 'react-router-dom';
import '../static/css/Header.css';
import logo from '../static/images/Logo2.png';

const Header = () => {
  return (
    <header className="header">
      <a href="/" className="logo">
        <img className="logo-image" src={logo} alt="Budget app logo" />
      </a>
      <nav>
        <ul>
          <li>
            <Link to="/about">About Me</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
