# ExamGuide

## Current State
Full-stack app with Motoko backend and React frontend. Features: exam categories, study notes (text/markdown only), guidance posts, tutor/mentor profiles, booking requests, reviews, bookmarks, user profiles, Stripe payments, and an admin dashboard. Notes are currently text/markdown only — no file upload capability.

## Requested Changes (Diff)

### Add
- **Backend**: `blob-storage` component for scalable file uploads (PDF, JPG, PNG, DOCX, etc.)
- **Backend**: `fileId` optional field on `StudyNote` to link an uploaded file
- **Backend**: `fileName` and `fileType` optional fields on `StudyNote` for display metadata
- **Frontend**: File upload UI in the "Add Note" and "Edit Note" dialogs — drag-and-drop zone plus file picker supporting any file type
- **Frontend**: Uploaded file preview/download link on the note view dialog (shows file name, type icon, and download button for PDF/DOC; inline image preview for JPG/PNG)
- **Frontend**: Notes with attached files show a file badge/indicator on the note card

### Modify
- **Backend**: `createStudyNote` accepts optional `fileId`, `fileName`, `fileType` parameters
- **Backend**: `updateStudyNote` accepts optional `fileId`, `fileName`, `fileType` parameters
- **Frontend**: Note creation form — add optional file upload section below the content textarea
- **Frontend**: Note card — show a file attachment badge when a file is attached
- **Frontend**: Note view dialog — show file attachment section with download/preview

### Remove
- Nothing removed; text notes continue to work as before (file upload is optional)

## Implementation Plan
1. Select `blob-storage` component
2. Regenerate Motoko backend to add optional `fileId`, `fileName`, `fileType` fields to `StudyNote`, and update `createStudyNote`/`updateStudyNote` accordingly
3. Update frontend `NotesPage.tsx`:
   - Add file upload dropzone/picker in the note creation and edit forms
   - Upload file via blob-storage hook before submitting note, store returned fileId
   - Show file badge on note cards that have an attached file
   - In view dialog, render inline image preview (if image) or a download link (PDF/other)
4. Wire blob-storage upload/download URLs into the note display components
