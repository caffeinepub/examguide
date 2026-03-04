import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TutorMentorProfile {
    id: number;
    bio: string;
    subjects: Array<string>;
    name: string;
    user: Principal;
    hourlyRate?: number;
    isMentor: boolean;
    exams: Uint32Array;
    availability: string;
}
export interface ExamCategory {
    id: number;
    name: string;
    description: string;
}
export type Time = bigint;
export interface T {
    bio: string;
    displayName: string;
    expertiseTags: Array<string>;
}
export interface BookingRequest {
    id: number;
    status: BookingStatus;
    tutor: Principal;
    message: string;
    timestamp: Time;
    student: Principal;
}
export interface StudyNote {
    id: number;
    title: string;
    content: string;
    subject: string;
    examCategoryId: number;
    author: Principal;
    timestamp: Time;
}
export interface Review {
    id: number;
    tutor: Principal;
    text: string;
    author: Principal;
    timestamp: Time;
    rating: number;
}
export interface GuidancePost {
    id: number;
    title: string;
    examCategoryId: number;
    body: string;
    author: Principal;
    timestamp: Time;
}
export enum BookingStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(itemId: number): Promise<void>;
    addExamCategory(name: string, description: string): Promise<number>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBookingRequest(tutor: Principal, message: string): Promise<number>;
    createGuidancePost(title: string, body: string, examCategoryId: number): Promise<number>;
    createReview(tutor: Principal, rating: number, text: string): Promise<number>;
    createStudyNote(title: string, content: string, subject: string, examCategoryId: number): Promise<number>;
    createTutorMentorProfile(name: string, subjects: Array<string>, exams: Uint32Array, availability: string, hourlyRate: number | null, bio: string, isMentor: boolean): Promise<number>;
    createUserProfile(displayName: string, bio: string, expertiseTags: Array<string>): Promise<void>;
    deleteGuidancePost(id: number): Promise<void>;
    deleteStudyNote(id: number): Promise<void>;
    getAllExamCategories(): Promise<Array<ExamCategory>>;
    getAllGuidancePosts(): Promise<Array<GuidancePost>>;
    getAllStudyNotes(): Promise<Array<StudyNote>>;
    getAllTutorMentorProfiles(): Promise<Array<TutorMentorProfile>>;
    getBookingRequestsForTutor(tutor: Principal): Promise<Array<BookingRequest>>;
    getBookmarks(user: Principal): Promise<Uint32Array>;
    getCallerUserProfile(): Promise<T | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReviewsForTutor(tutor: Principal): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<T | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: T): Promise<void>;
    searchNotesByTitle(queryText: string): Promise<Array<StudyNote>>;
    updateBookingRequestStatus(id: number, status: BookingStatus): Promise<void>;
    updateGuidancePost(id: number, title: string, body: string): Promise<void>;
    updateStudyNote(id: number, title: string, content: string, subject: string): Promise<void>;
}
