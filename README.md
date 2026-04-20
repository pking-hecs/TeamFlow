# Collaborative Project and Task Management System

A lightweight, high-performance web application designed for efficient team collaboration and streamlined project management. This system serves as a functional alternative to resource-heavy enterprise tools, providing an optimal balance between simplicity and core utility for small to medium-sized teams.
1. Project Concept & Rationale

The Task Management System was developed to bridge the strategic gap between overly simplistic tools like Trello and complex, high-overhead enterprise solutions like Jira.

While enterprise tools offer comprehensive features, they often impose steep learning curves and significant system resource consumption. This project focuses on core functionalities—authentication, team hierarchies, and visual task tracking—to ensure productivity without unnecessary cognitive overhead.

2. Key Features

    Secure Authentication: Implements JWT-based token authentication with password security via bcrypt hashing.

    Role-Based Team Management: Users can create collaborative spaces and assign roles, distinguishing between team administrators and regular members.

    Hierarchical Organization: Enables the creation of projects within teams to act as containers for related tasks.

    Comprehensive Task Tracking: Tasks include properties such as title, description, priority (Low/Medium/High), and deadlines.

    Interactive Kanban Board: A visual three-column interface (To Do, In Progress, Done) supporting drag-and-drop functionality for intuitive status transitions.

    Advanced Filtering: Powerful search and filtering mechanisms to sort tasks by status, assignee, or priority level.

3. Technical Stack

The application utilizes a modern full-stack architecture designed for scalability and data integrity.

    Frontend:

        React.js: For efficient component-based UI development.

        Redux: Provides predictable global state management for authentication, teams, and tasks.

    Backend:

        Node.js & Express: A lightweight, event-driven runtime ideal for managing I/O-intensive operations and API routing.

    Database:

        MySQL: A relational database ensuring ACID compliance.

        Architecture: The schema is normalized to Third Normal Form (3NF) to eliminate data redundancy.

        Integrity: Employs foreign key constraints and cascading deletes to maintain referential integrity across users, teams, and projects.

4. Installation & Setup

To get this system running on your local machine, follow these steps:
Prerequisites

    Node.js (v14+ recommended)

    MySQL Server

    npm or yarn

Database Setup

    Log into your MySQL terminal.

    Create a new database: CREATE DATABASE task_manager;

    Execute the provided SQL schema scripts to create the necessary tables (Users, Teams, Memberships, Projects, Tasks, and Status).

Backend Setup

    Navigate to the /backend directory.

    Install dependencies:
    Bash

    npm install

    Create a .env file in the root of the backend folder and configure your variables:
    Code snippet

    DB_HOST=localhost
    DB_USER=your_username
    DB_PASS=your_password
    DB_NAME=task_manager
    JWT_SECRET=your_secret_key

    Start the server:
    Bash

    npm start

Frontend Setup

    Navigate to the /frontend directory.

    Install dependencies:
    Bash

    npm install

    Start the React application:
    Bash

    npm start

    The application should now be accessible at http://localhost:3000.

Contributors: Aditya Gayan, Ayush Ashutosh Jena, Naseh Ameen Sayrawala, and Tarun P.
