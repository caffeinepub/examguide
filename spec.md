# ExamGuide

## Current State
Full-stack app with Motoko backend and React frontend. Features: exam categories, study notes (with file attachments: PDF, images, Word, etc.), guidance posts, tutor/mentor profiles, booking requests, reviews, bookmarks, user profiles, Stripe payments, admin dashboard, transactions page, and role selection (student/tutor) on login.

Notes currently support file upload (images, PDFs, etc.) and in the view dialog:
- Images are shown inline
- Non-image files (PDF, Word, etc.) show only a download button — no preview

There is no chat system between users.

## Requested Changes (Diff)

### Add
**Backend:**
- `ChatMessage` type: `{ id: Nat32; conversationId: Text; sender: Principal; recipientOrGroup: Text; content: Text; sharedNoteId: ?Nat32; timestamp: Time.Time }`
- `sendMessage(recipientPrincipal: Principal, content: Text, sharedNoteId: ?Nat32) : async Nat32` — stores a message between two users; conversationId is derived from sorted pair of principals
- `getConversation(otherUser: Principal) : async [ChatMessage]` — returns messages between caller and otherUser
- `getMyConversations() : async [{ otherUser: Principal; lastMessage: Text; timestamp: Time.Time }]` — returns list of recent conversations for the caller

**Frontend:**
- Note file preview improvements: PDF files rendered in an `<iframe>` embed within the view dialog so users can read before downloading; images already inline
- `ChatPage` at `/chat` — lists the user's conversations and opens a thread view
- Chat thread: shows messages chronologically with a text input to send a new message
- "Share Note" button in view note dialog — opens a user-picker to send the note link/content via chat
- "Message" button on tutor profile cards — opens chat with that tutor pre-selected
- Chat nav link in Navbar for logged-in users

### Modify
- `NotesPage` view dialog: add PDF `<iframe>` preview panel above the download button for PDF files; for other non-image files, keep the download-only UI
- `Navbar`: add "Chat" link (visible only when logged in)

### Remove
- Nothing removed

## Implementation Plan
1. Add `ChatMessage` type, state, and ID counter to `main.mo`
2. Add `sendMessage`, `getConversation`, `getMyConversations` functions to `main.mo`
3. Regenerate backend to get updated `backend.d.ts`
4. Update `NotesPage` view dialog: wrap PDF file in `<iframe>` preview with a download button beneath
5. Create `ChatPage.tsx` with conversation list + thread view + send input + note-sharing
6. Add "Message" button to tutor profile cards on `TutorsPage`
7. Add "Share Note" button in `NotesPage` view dialog
8. Add `/chat` route to `App.tsx`
9. Add Chat nav link in `Navbar` for logged-in users
10. Validate and deploy
