# Frontend Integration & QA

## Onboarding

- [x] Welcome → How SpaceShare Works
- [x] How SpaceShare Works → Discover Spaces
- [x] Discover Spaces → Monetize Your Space
- [x] Monetize Your Space → How Will You Use SpaceShare?
- [x] Next/Continue navigation
- [x] Skip navigation
- [x] Desktop layout
- [x] Mobile layout
- [x] Final role selection → Authentication
  - Role selection was not working initially; fixed by adding click handling so users can switch between roles.
  - Continue currently navigates to `login.html`.
  - 🟡 Integration issue: `login.html` is not currently available on main, so the Authentication flow cannot be continued from onboarding.
  
## Authentication

- [ ] Login
- [ ] Sign Up
- [ ] Forgot Password
- [ ] Create New Password
- [ ] Cross-screen navigation
- [ ] Validation states
- [ ] Mobile

## Host

- [x] Basics
- [x] Details
- [x] Photos
- [x] Pricing & Availability
- [x] Review
- [x] Form validation
- [x] Error states
- [x] Review displays entered information
- [x] Publish listing
- [x] Submission success state
- [x] Responsive layout
- [ ] Uploaded photos → Review
  - 🟢 Frontend bug: Photos selected/uploaded on the Photos step do not appear on the Review page. Review displays default/dummy photos instead.
- [ ] Global navigation
  - 🟡 Integration issue: Become a Host, Explore Spaces, How It Works, Login, and List Your Space links do not navigate to their intended destinations.

## Seeker

- [ ] Search
- [ ] Search Results
- [ ] Workspace Details
- [ ] Details → Booking
- [ ] Booking result

## Global

- [ ] Navigation
- [ ] Mobile navigation
- [ ] Broken links
- [ ] Placeholder links
- [ ] Console errors
- [ ] Missing assets
- [ ] Responsive issues