import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  Download,
  Edit,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { StudyNote } from "../backend.d";
import { SAMPLE_EXAM_CATEGORIES, formatTimestamp } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateStudyNote,
  useDeleteStudyNote,
  useExamCategories,
  useSearchNotes,
  useStudyNotes,
  useUpdateStudyNote,
} from "../hooks/useQueries";
import { useStorageUpload } from "../hooks/useStorageUpload";

// ─── File size formatter ───────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File type icon/label helper ──────────────────────────────────────────────
function getFileLabel(fileType: string, fileName: string): string {
  if (fileType.startsWith("image/")) return "Image";
  if (fileType === "application/pdf") return "PDF";
  if (
    fileType.includes("word") ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".doc")
  )
    return "Document";
  if (
    fileType.includes("presentation") ||
    fileName.endsWith(".pptx") ||
    fileName.endsWith(".ppt")
  )
    return "Slides";
  if (
    fileType.includes("spreadsheet") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  )
    return "Spreadsheet";
  return "File";
}

// ─── File Upload Zone Component ───────────────────────────────────────────────
interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  existingFileName?: string;
  onRemoveExisting?: () => void;
  uploadProgress: number;
  isUploading: boolean;
  uploadError: string | null;
  disabled?: boolean;
}

function FileUploadZone({
  selectedFile,
  onFileSelect,
  existingFileName,
  onRemoveExisting,
  uploadProgress,
  isUploading,
  uploadError,
  disabled,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      onFileSelect(file);
      // reset input so same file can be re-selected
      e.target.value = "";
    },
    [onFileSelect],
  );

  // Show existing attachment (not being replaced yet)
  if (existingFileName && !selectedFile) {
    return (
      <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Paperclip className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {existingFileName}
            </p>
            <p className="text-xs text-muted-foreground">Current attachment</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs border-border/60 gap-1"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              data-ocid="notes.upload_button"
            >
              <Upload className="w-3 h-3" />
              Replace
            </Button>
            {onRemoveExisting && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={onRemoveExisting}
                disabled={disabled}
                aria-label="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="*/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    );
  }

  // Show selected file (pending upload or uploading)
  if (selectedFile) {
    return (
      <div
        className="rounded-xl border border-primary/30 bg-primary/5 p-3"
        data-ocid="notes.file.loading_state"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)} ·{" "}
              {getFileLabel(selectedFile.type, selectedFile.name)}
            </p>
          </div>
          {!isUploading && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onFileSelect(null)}
              disabled={disabled}
              aria-label="Remove selected file"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {isUploading && (
          <div className="space-y-1">
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">
              {uploadProgress}%
            </p>
          </div>
        )}
        {uploadError && (
          <p className="text-xs text-destructive mt-1">{uploadError}</p>
        )}
      </div>
    );
  }

  // Empty dropzone
  return (
    <div>
      <button
        type="button"
        className={cn(
          "w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer p-5 text-center",
          isDragging
            ? "border-primary/60 bg-primary/8"
            : "border-border/50 bg-surface-2 hover:border-primary/40 hover:bg-primary/5",
          disabled && "opacity-50 pointer-events-none",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        data-ocid="notes.dropzone"
        disabled={disabled}
        aria-label="Upload file — click or drag and drop"
      >
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-muted/50 border border-border/60 flex items-center justify-center">
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop file here or{" "}
              <span className="text-primary underline underline-offset-2">
                browse
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF, images, Word, PowerPoint, and more — any format
            </p>
          </div>
        </div>
      </button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-2 h-7 text-xs border-border/60 gap-1.5 w-full"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        data-ocid="notes.upload_button"
      >
        <Upload className="w-3 h-3" />
        Browse files
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({
  note,
  categoryName,
  isOwn,
  onView,
  onEdit,
  onDelete,
  index,
}: {
  note: StudyNote;
  categoryName: string;
  isOwn: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      data-ocid={`notes.item.${index + 1}`}
    >
      <button
        type="button"
        className="group h-full w-full text-left p-5 rounded-xl bg-card border border-border/60 cursor-pointer bg-card-hover"
        onClick={onView}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Badge
              variant="outline"
              className="text-xs border-teal/30 bg-teal/10 text-teal shrink-0"
            >
              {categoryName}
            </Badge>
            {note.fileId && (
              <Badge
                variant="outline"
                className="text-xs border-primary/30 bg-primary/8 text-primary shrink-0 gap-1"
                title={note.fileName ?? "Attachment"}
              >
                <Paperclip className="w-2.5 h-2.5" />
                {note.fileName
                  ? getFileLabel(note.fileType ?? "", note.fileName)
                  : "File"}
              </Badge>
            )}
          </div>
          {isOwn && (
            <div
              className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
                data-ocid={`notes.edit_button.${index + 1}`}
                aria-label="Edit note"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                data-ocid={`notes.delete_button.${index + 1}`}
                aria-label="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        <h3 className="font-display font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {note.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
          {note.content.substring(0, 180)}...
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {note.subject}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTimestamp(note.timestamp)}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewNote, setViewNote] = useState<StudyNote | null>(null);
  const [editNote, setEditNote] = useState<StudyNote | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Text form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");

  // File state for create form
  const [createFile, setCreateFile] = useState<File | null>(null);

  // File state for edit form
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editRemoveFile, setEditRemoveFile] = useState(false);

  // Storage upload hooks (one per dialog to keep progress isolated)
  const createUpload = useStorageUpload();
  const editUpload = useStorageUpload();

  const { data: backendNotes, isLoading: notesLoading } = useStudyNotes();
  const { data: searchResults } = useSearchNotes(debouncedSearch);
  const { data: backendCategories } = useExamCategories();

  const createNote = useCreateStudyNote();
  const updateNote = useUpdateStudyNote();
  const deleteNote = useDeleteStudyNote();

  const categories =
    backendCategories && backendCategories.length > 0
      ? backendCategories
      : SAMPLE_EXAM_CATEGORIES;

  const allNotes = backendNotes ?? [];

  const displayNotes = useMemo(() => {
    let notes = debouncedSearch && searchResults ? searchResults : allNotes;
    if (selectedCategory !== "all") {
      notes = notes.filter(
        (n) => n.examCategoryId === Number(selectedCategory),
      );
    }
    return notes;
  }, [allNotes, debouncedSearch, searchResults, selectedCategory]);

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? "General";

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const timer = setTimeout(() => setDebouncedSearch(val), 300);
    return () => clearTimeout(timer);
  };

  const openCreate = () => {
    setFormTitle("");
    setFormContent("");
    setFormSubject("");
    setFormCategoryId("");
    setCreateFile(null);
    createUpload.resetUpload();
    setCreateOpen(true);
  };

  const openEdit = (note: StudyNote) => {
    setEditNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormSubject(note.subject);
    setFormCategoryId(String(note.examCategoryId));
    setEditFile(null);
    setEditRemoveFile(false);
    editUpload.resetUpload();
  };

  const handleCreate = async () => {
    if (!formTitle || !formContent || !formSubject || !formCategoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    let fileId: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    if (createFile) {
      try {
        const uploaded = await createUpload.uploadFile(createFile);
        fileId = uploaded.fileId;
        fileName = uploaded.fileName;
        fileType = uploaded.fileType;
      } catch {
        toast.error("File upload failed — please try again");
        return;
      }
    }

    try {
      await createNote.mutateAsync({
        title: formTitle,
        content: formContent,
        subject: formSubject,
        examCategoryId: Number(formCategoryId),
        fileId,
        fileName,
        fileType,
      });
      toast.success("Note created!");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create note");
    }
  };

  const handleUpdate = async () => {
    if (!editNote || !formTitle || !formContent || !formSubject) return;

    let fileId: string | null = editRemoveFile
      ? null
      : (editNote.fileId ?? null);
    let fileName: string | null = editRemoveFile
      ? null
      : (editNote.fileName ?? null);
    let fileType: string | null = editRemoveFile
      ? null
      : (editNote.fileType ?? null);

    if (editFile) {
      try {
        const uploaded = await editUpload.uploadFile(editFile);
        fileId = uploaded.fileId;
        fileName = uploaded.fileName;
        fileType = uploaded.fileType;
      } catch {
        toast.error("File upload failed — please try again");
        return;
      }
    }

    try {
      await updateNote.mutateAsync({
        id: editNote.id,
        title: formTitle,
        content: formContent,
        subject: formSubject,
        fileId,
        fileName,
        fileType,
      });
      toast.success("Note updated!");
      setEditNote(null);
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const isOwnNote = (note: StudyNote) => {
    if (!principal) return false;
    try {
      return note.author.toString() === principal.toString();
    } catch {
      return false;
    }
  };

  const isCreateLoading = createNote.isPending || createUpload.isUploading;
  const isUpdateLoading = updateNote.isPending || editUpload.isUploading;

  const NoteForm = ({
    onSubmit,
    loading,
    submitLabel,
    file,
    onFileSelect,
    existingFileName,
    onRemoveExisting,
    uploadProgress,
    isUploading,
    uploadError,
  }: {
    onSubmit: () => void;
    loading: boolean;
    submitLabel: string;
    file: File | null;
    onFileSelect: (f: File | null) => void;
    existingFileName?: string;
    onRemoveExisting?: () => void;
    uploadProgress: number;
    isUploading: boolean;
    uploadError: string | null;
  }) => (
    <div className="space-y-4 mt-2">
      <div>
        <Label
          htmlFor="note-title"
          className="text-sm font-medium text-foreground mb-1.5 block"
        >
          Title
        </Label>
        <Input
          id="note-title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="e.g. SAT Math — Quadratic Equations"
          data-ocid="notes.input"
          className="bg-surface-2 border-border/60"
          disabled={loading}
        />
      </div>
      <div>
        <Label
          htmlFor="note-subject"
          className="text-sm font-medium text-foreground mb-1.5 block"
        >
          Subject
        </Label>
        <Input
          id="note-subject"
          value={formSubject}
          onChange={(e) => setFormSubject(e.target.value)}
          placeholder="e.g. Mathematics, Verbal, Physics"
          className="bg-surface-2 border-border/60"
          disabled={loading}
        />
      </div>
      <div>
        <Label
          htmlFor="note-category"
          className="text-sm font-medium text-foreground mb-1.5 block"
        >
          Exam Category
        </Label>
        <Select
          value={formCategoryId}
          onValueChange={setFormCategoryId}
          disabled={loading}
        >
          <SelectTrigger
            data-ocid="notes.select"
            className="bg-surface-2 border-border/60"
          >
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label
          htmlFor="note-content"
          className="text-sm font-medium text-foreground mb-1.5 block"
        >
          Content{" "}
          <span className="text-muted-foreground font-normal">
            (optional, Markdown supported)
          </span>
        </Label>
        <Textarea
          id="note-content"
          value={formContent}
          onChange={(e) => setFormContent(e.target.value)}
          placeholder="Write your study notes here... Use markdown for formatting."
          rows={6}
          data-ocid="notes.textarea"
          className="bg-surface-2 border-border/60 font-mono text-sm"
          disabled={loading}
        />
      </div>

      {/* File attachment */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          Attachment{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <FileUploadZone
          selectedFile={file}
          onFileSelect={onFileSelect}
          existingFileName={existingFileName}
          onRemoveExisting={onRemoveExisting}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          uploadError={uploadError}
          disabled={loading}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
          data-ocid="notes.submit_button"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isUploading ? `Uploading... ${uploadProgress}%` : submitLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge
                variant="outline"
                className="mb-3 border-teal/40 bg-teal/10 text-teal"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                Study Notes Library
              </Badge>
              <h1 className="text-4xl font-display font-bold text-foreground">
                Expert Study Notes
              </h1>
              <p className="text-muted-foreground mt-1.5">
                Browse high-quality notes from top scorers worldwide
              </p>
            </div>
            {isLoggedIn && (
              <Button
                onClick={openCreate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-2"
                data-ocid="notes.add_button"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search notes by title..."
              className="pl-9 bg-surface-2 border-border/60"
              data-ocid="notes.search_input"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              className="w-full sm:w-48 bg-surface-2 border-border/60"
              data-ocid="notes.filter.select"
            >
              <SelectValue placeholder="All Exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes Grid */}
        {notesLoading ? (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="notes.loading_state"
          >
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
              <div
                key={key}
                className="p-5 rounded-xl bg-card border border-border/60"
              >
                <Skeleton className="h-5 w-20 mb-3" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : displayNotes.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl bg-card border border-border/60"
            data-ocid="notes.empty_state"
          >
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No notes found
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {searchQuery
                ? `No notes match "${searchQuery}"`
                : "Be the first to add notes for this exam!"}
            </p>
            {isLoggedIn && (
              <Button
                onClick={openCreate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                data-ocid="notes.empty_state.add_button"
              >
                <Plus className="w-4 h-4" />
                Add First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayNotes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  categoryName={getCategoryName(note.examCategoryId)}
                  isOwn={isOwnNote(note)}
                  onView={() => setViewNote(note)}
                  onEdit={() => openEdit(note)}
                  onDelete={() => handleDelete(note.id)}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── View Note Dialog ── */}
      <Dialog open={!!viewNote} onOpenChange={(o) => !o && setViewNote(null)}>
        <DialogContent
          className="max-w-2xl bg-card border-border/60 max-h-[85vh] overflow-y-auto"
          data-ocid="notes.dialog"
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs border-teal/30 bg-teal/10 text-teal"
              >
                {viewNote && getCategoryName(viewNote.examCategoryId)}
              </Badge>
              {viewNote && (
                <Badge variant="outline" className="text-xs">
                  {viewNote.subject}
                </Badge>
              )}
              {viewNote?.fileId && viewNote.fileName && (
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 bg-primary/8 text-primary gap-1"
                >
                  <Paperclip className="w-2.5 h-2.5" />
                  {getFileLabel(viewNote.fileType ?? "", viewNote.fileName)}
                </Badge>
              )}
            </div>
            <DialogTitle className="font-display text-xl text-left pr-6">
              {viewNote?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Anonymous Author
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {viewNote && formatTimestamp(viewNote.timestamp)}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Note content */}
          {viewNote?.content && (
            <div className="mt-4 prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-body text-sm text-foreground/90 leading-relaxed bg-surface-2 rounded-lg p-4 border border-border/50">
                {viewNote.content}
              </pre>
            </div>
          )}

          {/* File attachment section */}
          {viewNote?.fileId && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Attachment
              </p>
              {viewNote.fileType?.startsWith("image/") ? (
                <div className="rounded-xl overflow-hidden border border-border/60 bg-surface-2">
                  <img
                    src={viewNote.fileId}
                    alt={viewNote.fileName ?? "Attached image"}
                    className="w-full max-h-80 object-contain"
                    loading="lazy"
                  />
                  {viewNote.fileName && (
                    <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate">
                        {viewNote.fileName}
                      </span>
                      <a
                        href={viewNote.fileId}
                        download={viewNote.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 border border-border/60">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {viewNote.fileName ?? "Attached file"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {viewNote.fileType
                        ? getFileLabel(
                            viewNote.fileType,
                            viewNote.fileName ?? "",
                          )
                        : "File"}
                    </p>
                  </div>
                  <a
                    href={viewNote.fileId}
                    download={viewNote.fileName ?? true}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      data-ocid="notes.download.button"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setViewNote(null)}
              data-ocid="notes.close_button"
              className="border-border/60"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create Note Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="max-w-lg bg-card border-border/60 max-h-[90vh] overflow-y-auto"
          data-ocid="notes.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Create Study Note
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Share your knowledge — add text notes and attach any file (PDF,
              images, Word, etc.)
            </DialogDescription>
          </DialogHeader>
          <NoteForm
            onSubmit={handleCreate}
            loading={isCreateLoading}
            submitLabel="Create Note"
            file={createFile}
            onFileSelect={setCreateFile}
            uploadProgress={createUpload.uploadProgress}
            isUploading={createUpload.isUploading}
            uploadError={createUpload.uploadError}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit Note Dialog ── */}
      <Dialog open={!!editNote} onOpenChange={(o) => !o && setEditNote(null)}>
        <DialogContent
          className="max-w-lg bg-card border-border/60 max-h-[90vh] overflow-y-auto"
          data-ocid="notes.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit Study Note
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Update your note content or replace the attached file
            </DialogDescription>
          </DialogHeader>
          <NoteForm
            onSubmit={handleUpdate}
            loading={isUpdateLoading}
            submitLabel="Save Changes"
            file={editFile}
            onFileSelect={setEditFile}
            existingFileName={
              !editRemoveFile && !editFile && editNote?.fileId
                ? (editNote.fileName ?? "Attached file")
                : undefined
            }
            onRemoveExisting={() => setEditRemoveFile(true)}
            uploadProgress={editUpload.uploadProgress}
            isUploading={editUpload.isUploading}
            uploadError={editUpload.uploadError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
