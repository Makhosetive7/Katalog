# Katalog

A **Node.js + Express** backend for managing books, reading progress, challenges, goals, achievements, notes, and user authentication
This project helps readers track their habits, measure progress, and stay motivated with achievements and streaks

---

## Features

### User & Authentication

- User registration, login, logout, and demo login
- Email verification and resend verification
- Secure password reset (with token + expiration)
- Profile management (update profile, change password)
- Rate limiting for authentication endpoints

### Books management

- CRUD operations for books (create, update, delete)
- Search books and filter by status
- Recently added books endpoint
- Book-specific statistics and analytics
- Log current reading progress per book
- Get aggregated reading progress and analytics dashboards
- Access detailed reading statistics for users

### Reading Progress & Analytics

- Log and update reading progress by book
- Dashboard view of progress across all books
- Analytics for reading trends and statistics

### Goals & Challenges

- Set and manage **reading goals** per book
- Track progress toward goals
- Set reading challenges and track progress
- Check and unlock challenge achievements

### Achievements tracking

- Track user achievements across:
  - Books read
  - Genres completed
  - Reading streaks
- Achievement progress checks

- ## Chapter notes

- Create notes linked to chapters or books
- Update, delete, and retrieve notes
- View grouped notes across books

### Reading streaks

- Track daily/weekly reading streaks
- Update streaks automatically with reading activity

---

## Workflow

### User Onboarding

**User Registration → Email Verification → Profile Setup**  
Start your journey by creating an account, verifying your email, and customizing your profile to reflect your reading preferences

### Book Management

**Add Books → Set Reading Status → Track Progress**  
Build your personal library, categorize books by reading status (e.g., "To Read", "Reading", "Completed"), and log your progress as you go

### Goal Setting

**Set Goals → Log Reading Sessions → Monitor Progress**  
Define specific reading goals per book, log sessions to stay accountable, and visualize your progress with intuitive dashboards

### Notes & Insights

**Take Notes → Review Analytics → Adjust Reading Habits**  
Capture thoughts and reflections per chapter, analyze your reading behavior, and fine-tune your habits for deeper engagement

---

## API Endpoints Overview

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/demo`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### User Profile

- `GET /user/myProfile`
- `PUT /user/updateProfile`
- `PUT /user/change-password`

### Books

- `GET /books/`
- `GET /books/search`
- `GET /books/recentAddedBooks`
- `GET /books/bookStatus/:status`
- `GET /books/getBookById/:id`
- `POST /books/createBook`
- `PUT /books/updateBook/:id`
- `DELETE /books/deleteBook/:id`
- `PUT /books/:id/progress`
- `GET /books/progress/dashboard`
- `GET /books/:id/analytics`
- `GET /books/reading-stats`

### Reading Goals

- `POST /books/:bookId/goals`
- `GET /books/:bookId/goals`
- `GET /books/goals/check`
- `GET /books/goals/stats/:userId/:bookId`
- `GET /books/goals/:goalId/progress`
- `PUT /books/goals/:goalId`
- `DELETE /books/goals/:goalId`

### Challenges

- `POST /challenges/readingChallenge`
- `GET /challenges/readingChallenge`
- `GET /challenges/progress`
- `GET /challenges/achievementCheck`

### Achievements

- `GET /achievements/userAchievements`
- `GET /achievements/bookAchievements`
- `GET /achievements/genreAchievements`
- `GET /achievements/streakAchievements`

### Notes

- `POST /books/:bookId/notes`
- `GET /books/:bookId/notes`
- `PUT /books/notes/:noteId`
- `DELETE /books/notes/:noteId`
- `GET /books/notes/grouped`

### Streaks

- `GET /streaks/readingStreak`
- `PUT /streaks/readingStreak`

---

## Tech Stack

- **Backend Framework**: [Express.js](https://expressjs.com/)
- **Database**: MongoDB (via Mongoose models)
- **Authentication**: JWT + Middleware protection
- **Security**: Rate limiting, validation, tokenized reset
- **Other**: Modular route/controller structure
