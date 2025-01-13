import React from "react";
import "../static/css/AboutMe.css";

const AboutMe = () => {
    return (
        <div className="about-me-container">
            <header className="about-me-header">
                <h1 className="about-me-name">Elior Abaev</h1>
                <p className="about-me-title">Junior Front-End Developer</p>
                <p className="contact-info">
                    <a href="mailto:Elior.Abaev@gmail.com" className="contact-link">Elior.Abaev@gmail.com</a> |{" "}
                    <a href="https://www.linkedin.com/in/elior-abaev-a4b1b6286/" target="_blank" rel="noopener noreferrer" className="contact-link">
                        LinkedIn
                    </a>{" "}
                    |{" "}
                    <a href="https://github.com/eliorabaev" target="_blank" rel="noopener noreferrer" className="contact-link">
                        GitHub
                    </a>
                </p>
            </header>

            <section className="about-me-section">
                <h2>About Me</h2>
                <p>
                    I am a dedicated and highly motivated Computer Science student at HIT, with a strong foundation in Python, C++, SQL, 
                    and full-stack web development. I thrive in collaborative environments, taking on challenges that foster growth and 
                    innovation. Currently, I work as a front-end developer using Magento 2, and I am fluent in Hebrew, English, and Russian.
                </p>
            </section>

            <section className="about-me-section">
                <h2>Professional Experience</h2>
                <div className="experience">
                    <h3>Electra Consumer Products Ltd (<a href="https://www.payngo.co.il" target="_blank" rel="noopener noreferrer" class="links">
                        payngo.co.il
                    </a>)</h3>
                    <p><strong>Front-End Developer</strong> (November 2024 – Present)</p>
                    <ul>
                        <li>
                            Proactively identified and resolved critical bugs using robust testing methodologies, enhancing user experience
                            and website reliability.
                        </li>
                        <li>
                            Implemented cutting-edge design updates for better visual appeal and functionality, creating a more intuitive user interface.
                        </li>
                        <li>
                            Collaborated with cross-functional teams, including designers and developers, to deliver high-quality projects
                            on time and within budget.
                        </li>
                    </ul>
                    <p><strong>Quality Assurance & Web Designer</strong> (February 2022 – Present)</p>
                    <ul>
                        <li>
                            Reported and resolved a critical bug in the Magento 2 Module, Mirasvit Related Product, boosting cart page sales
                            by 120%.
                        </li>
                        <li>
                            Designed and implemented user-friendly features using Magento 2 and Adoric, improving interaction metrics by 85%.
                        </li>
                        <li>
                            Led training sessions for eight new team members, fostering knowledge-sharing and collaboration.
                        </li>
                    </ul>
                </div>
            </section>

            <section className="about-me-section">
                <h2>Projects</h2>
                <div className="projects">
                    <h3>
                        <a
                            href="https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/budget-app-eliorabaev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="links"
                        >
                            Budget App
                        </a>
                    </h3>
                    <ul>
                        <li>
                            A full-stack application designed to help users manage their finances effectively with features like tracking balances,
                            incomes, and expenses.
                        </li>
                        <li>
                            <strong>Features:</strong> Financial tracking, personalized suggestions, and microservice architecture with React and
                            FastAPI.
                        </li>
                        <li>
                            <strong>Tech Stack:</strong> React, FastAPI, Docker, Python, Node.js, RESTful APIs.
                        </li>
                    </ul>
                    <h3>
                        <a href="https://github.com/eliorabaev/WeatherApp" target="_blank" rel="noopener noreferrer" className="links">
                            Weather App
                        </a>
                    </h3>
                    <ul>
                        <li>A full-stack application that fetches and displays weather information.</li>
                        <li><strong>Tech Stack:</strong> Node.js, Express.js, Axios, EJS, JavaScript, HTML, CSS.</li>
                    </ul>

                    <h3>
                        <a href="https://github.com/eliorabaev/Keeper-App" target="_blank" rel="noopener noreferrer" className="links">
                            Keeper App
                        </a>
                    </h3>
                    <ul>
                        <li>A note-taking application built with React.</li>
                        <li><strong>Tech Stack:</strong> React, Material-UI, TypeScript, JavaScript, HTML, CSS.</li>
                    </ul>

                    <h3>
                        <a href="https://github.com/eliorabaev/CarRental.com" target="_blank" rel="noopener noreferrer" className="links">
                            Car Rental System
                        </a>
                    </h3>
                    <ul>
                        <li>A car rental system with a graphical user interface.</li>
                        <li><strong>Tech Stack:</strong> C#, OOP, Event-Driven Programming, UI Design.</li>
                    </ul>

                    <h3>
                        <a href="https://github.com/eliorabaev/machine-learning" target="_blank" rel="noopener noreferrer" className="links">
                            Wine Type Classification
                        </a>
                    </h3>
                    <ul>
                        <li>A machine learning project classifying wines based on their chemical composition.</li>
                        <li><strong>Tech Stack:</strong> Python, Scikit-learn, Pandas, NumPy.</li>
                    </ul>
                </div>
            </section>

            <section className="about-me-section">
                <h2>Education</h2>
                <p>
                    <strong>B.Sc. Computer Science, HIT Holon Institute of Technology</strong> (2022 – 2025)
                </p>
                <ul>
                    <li>GPA: 86; Excellence Scholarship Recipient</li>
                    <li>Key Courses: Machine Learning (100), Advanced C Programming (96), Algorithms (94), Database (86)</li>
                </ul>
            </section>

            <section className="about-me-section">
                <h2>Skills</h2>
                <ul className="skills-list">
                    <li>Operating Systems & Tools: Linux, Docker, Git, Bitbucket, PHPStorm</li>
                    <li>Programming Languages: JavaScript, PHP, C, C++, C#, Python</li>
                    <li>Web Development: HTML, CSS, Magento 2, RESTful APIs, Node.js</li>
                    <li>Databases: SQL, Data Management</li>
                    <li>Specialized Skills: Object-Oriented Programming, Algorithms, Data Structures</li>
                </ul>
            </section>

            <section className="about-me-section">
                <h2>Languages</h2>
                <p>Hebrew (Native), English (Fluent), Russian (Fluent)</p>
            </section>
        </div>
    );
};

export default AboutMe;
