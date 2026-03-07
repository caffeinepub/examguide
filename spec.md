# ExamGuide

## Current State
Full-stack app with Motoko backend and React frontend. Features: exam categories, study notes, guidance posts, tutor/mentor profiles, booking requests, reviews, bookmarks, user profiles, Stripe payments, admin dashboard with claim-admin.

Login flow: clicking "Sign In" immediately triggers Internet Identity login. After login, the user lands on their profile with no role pre-selection step.

The backend has `saveCallerUserProfile` which stores a profile with `displayName`, `bio`, and `expertiseTags`. The `expertiseTags` array is currently used to store free-form tags but can also hold a role tag like "student" or "tutor".

There is no frontend step that captures whether the user is a student or tutor before or right after login.

## Requested Changes (Diff)

### Add
- **RoleSelectionModal component**: A modal dialog that appears when the user clicks "Sign In". It presents two large, visually distinct cards: "I am a Student" and "I am a Tutor/Mentor". The user selects one, then the login flow proceeds (Internet Identity opens). The selected role is stored in localStorage as `examguide_pending_role`.
- **Post-login role assignment**: After a successful login, check if `examguide_pending_role` is set in localStorage. If the user has no existing profile, automatically create one with `expertiseTags: ["student"]` or `expertiseTags: ["tutor"]` depending on the pending role, then clear the localStorage key.
- **Role-aware UI**: Display the user's role ("Student" or "Tutor") in the Navbar next to their identity indicator (small badge), and on the Profile page.
- **useUserRole hook**: A convenience hook that derives whether the current user is a student or tutor from `expertiseTags[0]` of their profile.

### Modify
- **Navbar Sign In button**: Instead of directly calling `login()`, opens the RoleSelectionModal first. After the user picks their role, the modal triggers `login()`.
- **ProfilePage**: Show the assigned role prominently (e.g. "Student" or "Tutor/Mentor" badge). Allow the user to change their role from this page.
- **main.tsx / App.tsx**: Add a `PostLoginRoleAssigner` component that watches for login success and runs the profile-creation/role-assignment logic.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `RoleSelectionModal.tsx` component with two role cards (Student / Tutor) and a confirm button that triggers login
2. Update `Navbar.tsx` to open the modal instead of directly calling `login()`
3. Create `PostLoginRoleAssigner.tsx` component that on login success reads `examguide_pending_role`, checks if a profile exists, creates one if not, then clears the key
4. Mount `PostLoginRoleAssigner` in `App.tsx` inside the router root
5. Create `useUserRole` hook derived from `useCallerProfile`
6. Update `ProfilePage.tsx` to show role badge and allow changing it
7. Add role badge to Navbar for logged-in users
