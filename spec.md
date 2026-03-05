# ExamGuide

## Current State
Full-stack app with Motoko backend and React frontend. Features: exam categories, study notes, guidance posts, tutor/mentor profiles, booking requests, reviews, bookmarks, user profiles, Stripe payments, admin dashboard with claim-admin, platform fee (35%) with disclosure, AdminGuard, transaction recording hooks (useGetMyTransactions, useGetAllTransactions, useRecordTransaction) already in useQueries.ts. No dedicated transactions page or nav link exists.

## Requested Changes (Diff)

### Add
- New `/transactions` route and `TransactionsPage.tsx` page component
- Page shows the logged-in user's own transaction history pulled from `useGetMyTransactions()`
- For admin users, additionally shows an "All Transactions" tab using `useGetAllTransactions()`
- Each transaction row shows: session type, tutor name, total amount, platform fee (35%), tutor payout (65%), and timestamp
- Empty state when no transactions exist
- Login prompt if not authenticated
- Nav link "Transactions" added to Navbar for logged-in users

### Modify
- `App.tsx`: add `transactionsRoute` at `/transactions`
- `Navbar.tsx`: add "Transactions" nav link for authenticated users

### Remove
- Nothing removed
