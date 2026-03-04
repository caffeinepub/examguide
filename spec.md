# ExamGuide

## Current State

New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add

**Backend:**
- User profiles (students, tutors, mentors) with roles and subject expertise
- Exam categories (e.g. SAT, GMAT, GRE, IELTS, JEE, UPSC, A-Levels, etc.)
- Notes: CRUD for study notes organized by exam and subject
- Tutor/Mentor listings: profiles with subjects, availability, bio, exam expertise
- Guidance posts: articles or tips organized by exam category
- Bookmarks: students can bookmark notes and tutors
- Reviews/ratings for tutors and mentors

**Frontend:**
- Landing page with exam category browsing
- Notes library: browse, search, and view notes by exam
- Tutor/Mentor directory: browse profiles, filter by exam/subject
- Tutor profile page with contact/booking request
- Guidance articles page by exam category
- User profile: role selection (student/tutor/mentor), manage own notes or profile
- Bookmarks page for saved resources

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

1. Define backend data types: User, ExamCategory, Note, TutorProfile, GuidancePost, Bookmark, Review
2. Implement CRUD operations for notes and guidance posts
3. Implement tutor/mentor listing and profile management
4. Implement bookmarking and review/rating system
5. Build frontend: landing page, notes library, tutor directory, guidance section
6. Build user profile and role management UI
7. Wire all frontend components to backend APIs
