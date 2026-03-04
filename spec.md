# ExamGuide

## Current State
Full-stack app with Motoko backend and React frontend. Features: exam categories, study notes, guidance posts, tutor/mentor profiles, booking requests, reviews, bookmarks, user profiles, Stripe payments, and an admin page.

The admin claim flow uses `_initializeAccessControlWithSecret("")` which fails once `adminAssigned` is `true` (i.e., any user has registered). This means the owner cannot claim admin if other users registered first.

## Requested Changes (Diff)

### Add
- Backend: `claimInitialAdmin()` -- a one-time function that directly assigns the `#admin` role to the caller if `adminAssigned` is false. No token required. Traps if admin is already assigned or caller is anonymous.
- Backend: expose `claimInitialAdmin` in backend.d.ts

### Modify
- Frontend `useClaimAdminAccess` hook: call `actor.claimInitialAdmin()` instead of `actor._initializeAccessControlWithSecret("")`

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend with `claimInitialAdmin()` function added alongside all existing functions
2. Update frontend `useClaimAdminAccess` hook to call `claimInitialAdmin`
