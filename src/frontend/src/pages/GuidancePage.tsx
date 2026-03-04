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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Clock,
  Compass,
  Edit,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { GuidancePost } from "../backend.d";
import {
  SAMPLE_EXAM_CATEGORIES,
  SAMPLE_GUIDANCE_POSTS,
  formatTimestamp,
} from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateGuidancePost,
  useDeleteGuidancePost,
  useExamCategories,
  useGuidancePosts,
  useUpdateGuidancePost,
} from "../hooks/useQueries";

function ArticleCard({
  post,
  categoryName,
  isOwn,
  onView,
  onEdit,
  onDelete,
  index,
}: {
  post: GuidancePost;
  categoryName: string;
  isOwn: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const wordCount = post.body.split(" ").length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      data-ocid={`guidance.item.${index + 1}`}
    >
      <button
        type="button"
        className="group h-full w-full text-left p-5 rounded-xl bg-card border border-border/60 cursor-pointer bg-card-hover"
        onClick={onView}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-xs border-primary/30 bg-primary/10 text-primary shrink-0"
          >
            {categoryName}
          </Badge>
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
                data-ocid={`guidance.edit_button.${index + 1}`}
                aria-label="Edit article"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                data-ocid={`guidance.delete_button.${index + 1}`}
                aria-label="Delete article"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {post.body.substring(0, 200)}...
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {readTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTimestamp(post.timestamp)}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export default function GuidancePage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewPost, setViewPost] = useState<GuidancePost | null>(null);
  const [editPost, setEditPost] = useState<GuidancePost | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");

  const { data: backendPosts, isLoading } = useGuidancePosts();
  const { data: backendCategories } = useExamCategories();

  const createPost = useCreateGuidancePost();
  const updatePost = useUpdateGuidancePost();
  const deletePost = useDeleteGuidancePost();

  const categories =
    backendCategories && backendCategories.length > 0
      ? backendCategories
      : SAMPLE_EXAM_CATEGORIES;

  const allPosts = useMemo(() => {
    return backendPosts && backendPosts.length > 0
      ? backendPosts
      : SAMPLE_GUIDANCE_POSTS;
  }, [backendPosts]);

  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (selectedCategory !== "all") {
      posts = posts.filter(
        (p) => p.examCategoryId === Number(selectedCategory),
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
      );
    }
    return posts;
  }, [allPosts, selectedCategory, searchQuery]);

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? "General";

  const openCreate = () => {
    setFormTitle("");
    setFormBody("");
    setFormCategoryId("");
    setCreateOpen(true);
  };

  const openEdit = (post: GuidancePost) => {
    setEditPost(post);
    setFormTitle(post.title);
    setFormBody(post.body);
    setFormCategoryId(String(post.examCategoryId));
  };

  const handleCreate = async () => {
    if (!formTitle || !formBody || !formCategoryId) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await createPost.mutateAsync({
        title: formTitle,
        body: formBody,
        examCategoryId: Number(formCategoryId),
      });
      toast.success("Article published!");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to publish article");
    }
  };

  const handleUpdate = async () => {
    if (!editPost || !formTitle || !formBody) return;
    try {
      await updatePost.mutateAsync({
        id: editPost.id,
        title: formTitle,
        body: formBody,
      });
      toast.success("Article updated!");
      setEditPost(null);
    } catch {
      toast.error("Failed to update article");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const isOwnPost = (post: GuidancePost) => {
    if (!principal) return false;
    try {
      return post.author.toString() === principal.toString();
    } catch {
      return false;
    }
  };

  const ArticleForm = ({
    onSubmit,
    loading,
    submitLabel,
  }: {
    onSubmit: () => void;
    loading: boolean;
    submitLabel: string;
  }) => (
    <div className="space-y-4 mt-2">
      <div>
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          Title
        </Label>
        <Input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="e.g. How I Cracked IELTS Band 8 in 6 Weeks"
          className="bg-surface-2 border-border/60"
          data-ocid="guidance.input"
        />
      </div>
      <div>
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          Exam Category
        </Label>
        <Select value={formCategoryId} onValueChange={setFormCategoryId}>
          <SelectTrigger
            className="bg-surface-2 border-border/60"
            data-ocid="guidance.select"
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
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          Article Body
        </Label>
        <Textarea
          value={formBody}
          onChange={(e) => setFormBody(e.target.value)}
          placeholder="Share your exam strategy, tips, and insights..."
          rows={10}
          className="bg-surface-2 border-border/60 font-body text-sm"
          data-ocid="guidance.textarea"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
          data-ocid="guidance.submit_button"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );

  // Build tabs list
  const tabCategories = useMemo(() => {
    const usedIds = new Set(allPosts.map((p) => p.examCategoryId));
    return categories.filter((c) => usedIds.has(c.id));
  }, [categories, allPosts]);

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
                className="mb-3 border-chart-4/40 bg-chart-4/10 text-chart-4"
              >
                <Compass className="w-3.5 h-3.5 mr-1.5" />
                Guidance Articles
              </Badge>
              <h1 className="text-4xl font-display font-bold text-foreground">
                Strategic Exam Guidance
              </h1>
              <p className="text-muted-foreground mt-1.5">
                Insights from students who've been there — and scored big
              </p>
            </div>
            {isLoggedIn && (
              <Button
                onClick={openCreate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-2"
                data-ocid="guidance.add_button"
              >
                <Plus className="w-4 h-4" />
                Write Article
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search + Category Tabs */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="pl-9 bg-surface-2 border-border/60"
              data-ocid="guidance.search_input"
            />
          </div>

          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <div className="overflow-x-auto pb-1 scrollbar-thin">
              <TabsList
                className="bg-surface-2 border border-border/60 h-auto p-1 gap-1 flex-nowrap w-max"
                data-ocid="guidance.filter.tab"
              >
                <TabsTrigger
                  value="all"
                  className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  All Exams
                </TabsTrigger>
                {tabCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={String(cat.id)}
                    className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                    data-ocid={`guidance.${cat.name.toLowerCase()}.tab`}
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content for all tabs (we filter manually) */}
            <TabsContent value={selectedCategory} className="mt-6">
              {isLoading ? (
                <div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  data-ocid="guidance.loading_state"
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
              ) : filteredPosts.length === 0 ? (
                <div
                  className="text-center py-20 rounded-xl bg-card border border-border/60"
                  data-ocid="guidance.empty_state"
                >
                  <Compass className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">
                    No articles found
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Be the first to share your exam strategy!
                  </p>
                  {isLoggedIn && (
                    <Button
                      onClick={openCreate}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      data-ocid="guidance.empty_state.add_button"
                    >
                      <Plus className="w-4 h-4" />
                      Write First Article
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredPosts.map((post, i) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                        categoryName={getCategoryName(post.examCategoryId)}
                        isOwn={isOwnPost(post)}
                        onView={() => setViewPost(post)}
                        onEdit={() => openEdit(post)}
                        onDelete={() => handleDelete(post.id)}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* View Article Dialog */}
      <Dialog open={!!viewPost} onOpenChange={(o) => !o && setViewPost(null)}>
        <DialogContent
          className="max-w-2xl bg-card border-border/60 max-h-[85vh] overflow-y-auto"
          data-ocid="guidance.dialog"
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-xs border-primary/30 bg-primary/10 text-primary"
              >
                {viewPost && getCategoryName(viewPost.examCategoryId)}
              </Badge>
              {viewPost && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(viewPost.timestamp)}
                </span>
              )}
            </div>
            <DialogTitle className="font-display text-xl text-left leading-snug pr-6">
              {viewPost?.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Article content
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <pre className="whitespace-pre-wrap font-body text-sm text-foreground/90 leading-relaxed bg-surface-2 rounded-lg p-5 border border-border/50">
              {viewPost?.body}
            </pre>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setViewPost(null)}
              data-ocid="guidance.close_button"
              className="border-border/60"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Article Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="max-w-xl bg-card border-border/60 max-h-[85vh] overflow-y-auto"
          data-ocid="guidance.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Write Guidance Article
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Share your exam strategy and help thousands of students
            </DialogDescription>
          </DialogHeader>
          <ArticleForm
            onSubmit={handleCreate}
            loading={createPost.isPending}
            submitLabel="Publish Article"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}>
        <DialogContent
          className="max-w-xl bg-card border-border/60 max-h-[85vh] overflow-y-auto"
          data-ocid="guidance.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit Article
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Update your article content
            </DialogDescription>
          </DialogHeader>
          <ArticleForm
            onSubmit={handleUpdate}
            loading={updatePost.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
