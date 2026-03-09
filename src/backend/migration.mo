import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type ChatMessage = {
    id : Nat32;
    conversationId : Text;
    sender : Principal;
    recipient : Principal;
    content : Text;
    sharedNoteId : ?Nat32;
    timestamp : Time.Time;
  };

  type OldActor = {
    examCategories : Map.Map<Nat32, { id : Nat32; name : Text; description : Text }>;
    studyNotes : Map.Map<Nat32, {
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
    }>;
    guidancePosts : Map.Map<Nat32, {
      id : Nat32;
      title : Text;
      body : Text;
      examCategoryId : Nat32;
      author : Principal;
      timestamp : Time.Time;
    }>;
    tutorMentorProfiles : Map.Map<Nat32, {
      id : Nat32;
      user : Principal;
      name : Text;
      subjects : [Text];
      exams : [Nat32];
      availability : Text;
      hourlyRate : ?Nat32;
      bio : Text;
      isMentor : Bool;
    }>;
    bookingRequests : Map.Map<Nat32, {
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
    }>;
    reviews : Map.Map<Nat32, {
      id : Nat32;
      author : Principal;
      tutor : Principal;
      rating : Nat32;
      text : Text;
      timestamp : Time.Time;
    }>;
    bookmarks : Map.Map<Principal, List.List<Nat32>>;
    userProfiles : Map.Map<Principal, {
      displayName : Text;
      bio : Text;
      expertiseTags : [Text];
    }>;
    nextExamCategoryId : Nat;
    nextNoteId : Nat;
    nextPostId : Nat;
    nextProfileId : Nat;
    nextBookingId : Nat;
    nextReviewId : Nat;
  };

  type NewActor = {
    examCategories : Map.Map<Nat32, { id : Nat32; name : Text; description : Text }>;
    studyNotes : Map.Map<Nat32, {
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
    }>;
    guidancePosts : Map.Map<Nat32, {
      id : Nat32;
      title : Text;
      body : Text;
      examCategoryId : Nat32;
      author : Principal;
      timestamp : Time.Time;
    }>;
    tutorMentorProfiles : Map.Map<Nat32, {
      id : Nat32;
      user : Principal;
      name : Text;
      subjects : [Text];
      exams : [Nat32];
      availability : Text;
      hourlyRate : ?Nat32;
      bio : Text;
      isMentor : Bool;
    }>;
    bookingRequests : Map.Map<Nat32, {
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
    }>;
    reviews : Map.Map<Nat32, {
      id : Nat32;
      author : Principal;
      tutor : Principal;
      rating : Nat32;
      text : Text;
      timestamp : Time.Time;
    }>;
    bookmarks : Map.Map<Principal, List.List<Nat32>>;
    userProfiles : Map.Map<Principal, {
      displayName : Text;
      bio : Text;
      expertiseTags : [Text];
    }>;
    nextExamCategoryId : Nat;
    nextNoteId : Nat;
    nextPostId : Nat;
    nextProfileId : Nat;
    nextBookingId : Nat;
    nextReviewId : Nat;
    chatMessages : Map.Map<Nat32, ChatMessage>;
    nextMessageId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      chatMessages = Map.empty<Nat32, ChatMessage>();
      nextMessageId = 1;
    };
  };
};
