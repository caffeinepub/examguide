import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Stripe "stripe/stripe";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";

module {
  // Old data types
  type OldExamCategory = {
    id : Nat32;
    name : Text;
    description : Text;
  };

  type OldStudyNote = {
    id : Nat32;
    title : Text;
    content : Text;
    subject : Text;
    examCategoryId : Nat32;
    author : Principal;
    timestamp : Time.Time;
  };

  type OldGuidancePost = {
    id : Nat32;
    title : Text;
    body : Text;
    examCategoryId : Nat32;
    author : Principal;
    timestamp : Time.Time;
  };

  type OldTutorMentorProfile = {
    id : Nat32;
    user : Principal;
    name : Text;
    subjects : [Text];
    exams : [Nat32];
    availability : Text;
    hourlyRate : ?Nat32;
    bio : Text;
    isMentor : Bool;
  };

  type OldBookingRequest = {
    id : Nat32;
    student : Principal;
    tutor : Principal;
    message : Text;
    timestamp : Time.Time;
    status : {
      #pending;
      #accepted;
      #rejected;
    };
  };

  type OldReview = {
    id : Nat32;
    author : Principal;
    tutor : Principal;
    rating : Nat32;
    text : Text;
    timestamp : Time.Time;
  };

  type OldUserProfile = {
    displayName : Text;
    bio : Text;
    expertiseTags : [Text];
  };

  type OldActor = {
    var accessControlState : {
      userRoles : Map.Map<Principal, {
        #admin;
        #user;
        #guest;
      }>;
      var adminAssigned : Bool;
    };
    examCategories : Map.Map<Nat32, OldExamCategory>;
    studyNotes : Map.Map<Nat32, OldStudyNote>;
    guidancePosts : Map.Map<Nat32, OldGuidancePost>;
    tutorMentorProfiles : Map.Map<Nat32, OldTutorMentorProfile>;
    bookingRequests : Map.Map<Nat32, OldBookingRequest>;
    reviews : Map.Map<Nat32, OldReview>;
    bookmarks : Map.Map<Principal, List.List<Nat32>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextExamCategoryId : Nat;
    nextNoteId : Nat;
    nextPostId : Nat;
    nextProfileId : Nat;
    nextBookingId : Nat;
    nextReviewId : Nat;
    configuration : ?Stripe.StripeConfiguration;
  };

  // New data types
  type NewExamCategory = OldExamCategory;

  type NewStudyNote = {
    id : Nat32;
    title : Text;
    content : Text;
    subject : Text;
    examCategoryId : Nat32;
    author : Principal;
    timestamp : Time.Time;
    fileId : ?Text;
    fileName : ?Text;
    fileType : ?Text;
  };

  type NewGuidancePost = OldGuidancePost;
  type NewTutorMentorProfile = OldTutorMentorProfile;
  type NewBookingRequest = OldBookingRequest;
  type NewReview = OldReview;
  type NewUserProfile = OldUserProfile;

  type NewActor = {
    var accessControlState : {
      userRoles : Map.Map<Principal, {
        #admin;
        #user;
        #guest;
      }>;
      var adminAssigned : Bool;
    };
    examCategories : Map.Map<Nat32, NewExamCategory>;
    studyNotes : Map.Map<Nat32, NewStudyNote>;
    guidancePosts : Map.Map<Nat32, NewGuidancePost>;
    tutorMentorProfiles : Map.Map<Nat32, NewTutorMentorProfile>;
    bookingRequests : Map.Map<Nat32, NewBookingRequest>;
    reviews : Map.Map<Nat32, NewReview>;
    bookmarks : Map.Map<Principal, List.List<Nat32>>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    nextExamCategoryId : Nat;
    nextNoteId : Nat;
    nextPostId : Nat;
    nextProfileId : Nat;
    nextBookingId : Nat;
    nextReviewId : Nat;
    configuration : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    let newStudyNotes = old.studyNotes.map<Nat32, OldStudyNote, NewStudyNote>(
      func(_id, oldNote) {
        { oldNote with fileId = null; fileName = null; fileType = null };
      }
    );

    {
      var accessControlState = old.accessControlState;
      examCategories = old.examCategories;
      studyNotes = newStudyNotes;
      guidancePosts = old.guidancePosts;
      tutorMentorProfiles = old.tutorMentorProfiles;
      bookingRequests = old.bookingRequests;
      reviews = old.reviews;
      bookmarks = old.bookmarks;
      userProfiles = old.userProfiles;
      nextExamCategoryId = old.nextExamCategoryId;
      nextNoteId = old.nextNoteId;
      nextPostId = old.nextPostId;
      nextProfileId = old.nextProfileId;
      nextBookingId = old.nextBookingId;
      nextReviewId = old.nextReviewId;
      configuration = old.configuration;
    };
  };
};
