HRMS Lite

        A lightweight Human Resource Management System (HRMS) built as a web application to manage employees and track daily attendance.
        The project focuses on core HR functionality, clean UI, and production-ready deployment.

Features -

        1 - Employee Management
            - Add new employees (Employee ID, Name, Email, Department)
            - View all employees
            - Delete employees
    
        2 - Attendance Management
            - Mark attendance as Present (today only) or Absent (any past/today date)
            - Prevents future date selection
            - View attendance records per employee
            - Automatically calculates total present days per employee

Tech Stack -

        Frontend -
        - JavaScript (React)
        - Tailwind CSS
        - Deployed on Netlify
        
        Backend -
        - Python (Django + Django REST Framework)
        - MySQL database
        - Deployed on Render

System -

        - RESTful APIs with validation and proper error handling
        - Health check endpoint with DB connectivity verification

Live Links -

        Frontend: https://human-resource-managment-system.netlify.app/
        Backend API: https://human-resource-management-system-dz1s.onrender.com
        Health Check: https://human-resource-management-system-dz1s.onrender.com/health/

Setup (Local) -

        Backend -
        - pip install -r requirements.txt
        - python manage.py migrate
        - python manage.py runserver
        
        Frontend -
        - npm install
        - npm run dev
