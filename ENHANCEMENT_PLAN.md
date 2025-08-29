# K-pop Video Request Website - Enhancement Plan

## New Requirements Analysis

### 1. Real Authentication System
- Replace mock auth with actual user registration/login
- Password hashing and secure session management
- User database with profiles

### 2. User Profile System
- Profile settings page for username and profile picture editing
- User avatar upload/management
- Profile picture display in requests

### 3. Song Search Integration
- Replace YouTube link with Genius API song search
- Search and select functionality
- Validation that song exists on Genius
- Required field - cannot submit without selection

### 4. Request Management System
- Public request listings page
- Duplicate prevention (same song cannot be requested twice)
- User attribution (show username on requests)
- Request status tracking

### 5. PayPal Payment Integration
- PayPal payment button integration
- Credits system for users
- Ability to boost requests with credits
- Credit transaction tracking
- Display contributor names and amounts on requests

## Implementation Steps

### Phase 1: Database & Authentication
- [ ] Set up database schema (users, requests, transactions)
- [ ] Implement real user registration/login
- [ ] Add password hashing and JWT tokens
- [ ] Create user profile management

### Phase 2: Song Search Integration
- [ ] Integrate Genius API for song search
- [ ] Create song search component
- [ ] Replace YouTube field with song selector
- [ ] Add song validation

### Phase 3: Request System Enhancement
- [ ] Create public requests listing page
- [ ] Implement duplicate prevention
- [ ] Add user attribution to requests
- [ ] Request status management

### Phase 4: PayPal & Credits System
- [ ] Integrate PayPal payment system
- [ ] Create credits management system
- [ ] Add request boosting functionality
- [ ] Display contributors on requests

### Phase 5: UI/UX Improvements
- [ ] Profile settings page
- [ ] Enhanced request display
- [ ] Credits dashboard
- [ ] Payment confirmation flows

## Technical Requirements

### APIs Needed:
- Genius API for song search
- PayPal SDK for payments
- Database (SQLite/PostgreSQL)
- File upload for profile pictures

### New Database Tables:
- users (id, username, email, password_hash, profile_picture, credits)
- requests (id, user_id, song_id, song_title, artist, status, created_at)
- transactions (id, user_id, amount, paypal_transaction_id, created_at)
- request_boosts (id, request_id, user_id, credits_amount, created_at)
- songs (id, genius_id, title, artist, genius_url)
