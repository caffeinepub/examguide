import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useExamCategories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["examCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExamCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudyNotes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studyNotes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudyNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchNotes(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["searchNotes", query],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchNotesByTitle(query);
    },
    enabled: !!actor && !isFetching && query.length > 0,
  });
}

export function useGuidancePosts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["guidancePosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGuidancePosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTutorProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tutorProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTutorMentorProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReviewsForTutor(tutor: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["reviews", tutor?.toString()],
    queryFn: async () => {
      if (!actor || !tutor) return [];
      return actor.getReviewsForTutor(tutor);
    },
    enabled: !!actor && !isFetching && !!tutor,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookingRequestsForTutor(tutor: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookingRequests", tutor?.toString()],
    queryFn: async () => {
      if (!actor || !tutor) return [];
      return actor.getBookingRequestsForTutor(tutor);
    },
    enabled: !!actor && !isFetching && !!tutor,
  });
}

export function useBookmarks(user: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookmarks", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return new Uint32Array();
      return actor.getBookmarks(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useCreateStudyNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      subject,
      examCategoryId,
      fileId = null,
      fileName = null,
      fileType = null,
    }: {
      title: string;
      content: string;
      subject: string;
      examCategoryId: number;
      fileId?: string | null;
      fileName?: string | null;
      fileType?: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createStudyNote(
        title,
        content,
        subject,
        examCategoryId,
        fileId,
        fileName,
        fileType,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyNotes"] }),
  });
}

export function useUpdateStudyNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      subject,
      fileId = null,
      fileName = null,
      fileType = null,
    }: {
      id: number;
      title: string;
      content: string;
      subject: string;
      fileId?: string | null;
      fileName?: string | null;
      fileType?: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateStudyNote(
        id,
        title,
        content,
        subject,
        fileId,
        fileName,
        fileType,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyNotes"] }),
  });
}

export function useDeleteStudyNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStudyNote(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyNotes"] }),
  });
}

export function useCreateGuidancePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      body,
      examCategoryId,
    }: {
      title: string;
      body: string;
      examCategoryId: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGuidancePost(title, body, examCategoryId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guidancePosts"] }),
  });
}

export function useUpdateGuidancePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      body,
    }: {
      id: number;
      title: string;
      body: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGuidancePost(id, title, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guidancePosts"] }),
  });
}

export function useDeleteGuidancePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteGuidancePost(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guidancePosts"] }),
  });
}

export function useCreateTutorProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      subjects,
      exams,
      availability,
      hourlyRate,
      bio,
      isMentor,
    }: {
      name: string;
      subjects: string[];
      exams: Uint32Array;
      availability: string;
      hourlyRate: number | null;
      bio: string;
      isMentor: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTutorMentorProfile(
        name,
        subjects,
        exams,
        availability,
        hourlyRate,
        bio,
        isMentor,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tutorProfiles"] }),
  });
}

export function useCreateBookingRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tutor,
      message,
    }: {
      tutor: Principal;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBookingRequest(tutor, message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookingRequests"] }),
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: BookingStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBookingRequestStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookingRequests"] }),
  });
}

export function useCreateReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tutor,
      rating,
      text,
    }: {
      tutor: Principal;
      rating: number;
      text: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createReview(tutor, rating, text);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      expertiseTags,
    }: {
      displayName: string;
      bio: string;
      expertiseTags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile({ displayName, bio, expertiseTags });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      expertiseTags,
    }: {
      displayName: string;
      bio: string;
      expertiseTags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile({ displayName, bio, expertiseTags });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useAddBookmark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.addBookmark(itemId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).isStripeConfigured() as Promise<boolean>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      secretKey,
      allowedCountries,
    }: {
      secretKey: string;
      allowedCountries: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).setStripeConfiguration({
        secretKey,
        allowedCountries,
      }) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stripeConfigured"] }),
  });
}

export function useAddExamCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addExamCategory(name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["examCategories"] }),
  });
}

export function useClaimAdminAccess() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.claimInitialAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerRole"] });
      qc.invalidateQueries({ queryKey: ["adminStatus"] });
    },
  });
}

export function useAdminStatus() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminStatus"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getAdminStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export { BookingStatus };
