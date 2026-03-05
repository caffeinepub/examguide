import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Stripe "stripe/stripe";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

// Apply migration data transformation
(with migration = Migration.run)
actor {
  /// PREFABRICATED COMPONENTS
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Type Definitions
  module ExamCategory {
    public type T = {
      id : Nat32;
      name : Text;
      description : Text;
    };
    public func compare(a : T, b : T) : Order.Order {
      Nat32.compare(a.id, b.id);
    };
  };

  module StudyNote {
    public type T = {
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
    public func compare(a : T, b : T) : Order.Order {
      Nat32.compare(a.id, b.id);
    };
  };

  module GuidancePost {
    public type T = {
      id : Nat32;
      title : Text;
      body : Text;
      examCategoryId : Nat32;
      author : Principal;
      timestamp : Time.Time;
    };
    public func compare(a : T, b : T) : Order.Order {
      Nat32.compare(a.id, b.id);
    };
  };

  module TutorMentorProfile {
    public type T = {
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
    public func compare(a : T, b : T) : Order.Order {
      Nat32.compare(a.id, b.id);
    };
  };

  module BookingRequest {
    public type T = {
      id : Nat32;
      student : Principal;
      tutor : Principal;
      message : Text;
      timestamp : Time.Time;
      status : BookingStatus;
    };
    public func compare(a : T, b : T) : Order.Order {
      Nat32.compare(a.id, b.id);
    };
  };

  module Review {
    public type T = {
      id : Nat32;
      author : Principal;
      tutor : Principal;
      rating : Nat32;
      text : Text;
      timestamp : Time.Time;
    };
    public func compare(a : T, b : T) : Order.Order {
      Nat32.compare(a.id, b.id);
    };
  };

  module UserProfile {
    public type T = {
      displayName : Text;
      bio : Text;
      expertiseTags : [Text];
      // Other user metadata if needed
    };
  };

  public type BookingStatus = {
    #pending;
    #accepted;
    #rejected;
  };

  // State variables
  let examCategories = Map.empty<Nat32, ExamCategory.T>();
  let studyNotes = Map.empty<Nat32, StudyNote.T>();
  let guidancePosts = Map.empty<Nat32, GuidancePost.T>();
  let tutorMentorProfiles = Map.empty<Nat32, TutorMentorProfile.T>();
  let bookingRequests = Map.empty<Nat32, BookingRequest.T>();
  let reviews = Map.empty<Nat32, Review.T>();
  let bookmarks = Map.empty<Principal, List.List<Nat32>>();
  let userProfiles = Map.empty<Principal, UserProfile.T>();

  // ID Generation
  var nextExamCategoryId = 1;
  var nextNoteId = 1;
  var nextPostId = 1;
  var nextProfileId = 1;
  var nextBookingId = 1;
  var nextReviewId = 1;

  // Type Aliases
  public type Profile = UserProfile.T;
  public type ExamCategory = ExamCategory.T;
  public type StudyNote = StudyNote.T;
  public type GuidancePost = GuidancePost.T;
  public type TutorMentorProfile = TutorMentorProfile.T;
  public type BookingRequest = BookingRequest.T;
  public type Review = Review.T;

  // Stripe Configuration
  var configuration : ?Stripe.StripeConfiguration = null;

  /// TRANSFORM CALLBACK REQUIRED FOR HTTP OUTCALLS (e.g. Stripe)
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check payment session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile.T {
    // Anyone can view any user profile (public information)
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile.T) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Exam Category Management
  public shared ({ caller }) func addExamCategory(name : Text, description : Text) : async Nat32 {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add exam categories");
    };
    let id = Nat32.fromNat(nextExamCategoryId);
    nextExamCategoryId += 1;
    let category : ExamCategory = {
      id;
      name;
      description;
    };
    examCategories.add(id, category);
    id;
  };

  public query ({ caller }) func getAllExamCategories() : async [ExamCategory] {
    // Public read access - no authentication required
    examCategories.values().toArray().sort();
  };

  // Study Notes
  public shared ({ caller }) func createStudyNote(
    title : Text,
    content : Text,
    subject : Text,
    examCategoryId : Nat32,
    fileId : ?Text,
    fileName : ?Text,
    fileType : ?Text
  ) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create notes");
    };
    let id = Nat32.fromNat(nextNoteId);
    nextNoteId += 1;
    let note = {
      id;
      title;
      content;
      subject;
      examCategoryId;
      author = caller;
      timestamp = Time.now();
      fileId;
      fileName;
      fileType;
    };
    studyNotes.add(id, note);
    id;
  };

  public query ({ caller }) func getAllStudyNotes() : async [StudyNote] {
    // Public read access - no authentication required
    studyNotes.values().toArray().sort();
  };

  public shared ({ caller }) func updateStudyNote(
    id : Nat32,
    title : Text,
    content : Text,
    subject : Text,
    fileId : ?Text,
    fileName : ?Text,
    fileType : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notes");
    };
    switch (studyNotes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        if (note.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can update");
        };
        let updatedNote = { note with title; content; subject; fileId; fileName; fileType };
        studyNotes.add(id, updatedNote);
      };
    };
  };

  public shared ({ caller }) func deleteStudyNote(id : Nat32) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notes");
    };
    switch (studyNotes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        if (note.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can delete");
        };
        studyNotes.remove(id);
      };
    };
  };

  // Guidance Posts
  public shared ({ caller }) func createGuidancePost(title : Text, body : Text, examCategoryId : Nat32) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    let id = Nat32.fromNat(nextPostId);
    nextPostId += 1;
    let post = {
      id;
      title;
      body;
      examCategoryId;
      author = caller;
      timestamp = Time.now();
    };
    guidancePosts.add(id, post);
    id;
  };

  public query ({ caller }) func getAllGuidancePosts() : async [GuidancePost] {
    // Public read access - no authentication required
    guidancePosts.values().toArray().sort();
  };

  public shared ({ caller }) func updateGuidancePost(id : Nat32, title : Text, body : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update posts");
    };
    switch (guidancePosts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can update");
        };
        let updatedPost = { post with title; body };
        guidancePosts.add(id, updatedPost);
      };
    };
  };

  public shared ({ caller }) func deleteGuidancePost(id : Nat32) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };
    switch (guidancePosts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can delete");
        };
        guidancePosts.remove(id);
      };
    };
  };

  // Tutor/Mentor Profiles
  public shared ({ caller }) func createTutorMentorProfile(name : Text, subjects : [Text], exams : [Nat32], availability : Text, hourlyRate : ?Nat32, bio : Text, isMentor : Bool) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tutor/mentor profiles");
    };
    let id = Nat32.fromNat(nextProfileId);
    nextProfileId += 1;
    let profile = {
      id;
      user = caller;
      name;
      subjects;
      exams;
      availability;
      hourlyRate;
      bio;
      isMentor;
    };
    tutorMentorProfiles.add(id, profile);
    id;
  };

  public query ({ caller }) func getAllTutorMentorProfiles() : async [TutorMentorProfile] {
    // Public read access - no authentication required
    tutorMentorProfiles.values().toArray().sort();
  };

  // Booking Requests
  public shared ({ caller }) func createBookingRequest(tutor : Principal, message : Text) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create booking requests");
    };
    let id = Nat32.fromNat(nextBookingId);
    nextBookingId += 1;
    let request = {
      id;
      student = caller;
      tutor;
      message;
      timestamp = Time.now();
      status = #pending;
    };
    bookingRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getBookingRequestsForTutor(tutor : Principal) : async [BookingRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view booking requests");
    };
    // Only the tutor or admin can view their booking requests
    if (caller != tutor and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own booking requests or admin access required");
    };
    let allRequests = bookingRequests.values().toArray();
    allRequests.filter<BookingRequest>(func(req) { req.tutor == tutor }).sort();
  };

  public shared ({ caller }) func updateBookingRequestStatus(id : Nat32, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update booking requests");
    };
    switch (bookingRequests.get(id)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        // Only the tutor can update the status of their booking requests
        if (request.tutor != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the tutor or admin can update booking request status");
        };
        bookingRequests.add(id, { request with status });
      };
    };
  };

  // Reviews
  public shared ({ caller }) func createReview(tutor : Principal, rating : Nat32, text : Text) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create reviews");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid rating: must be between 1 and 5");
    };
    let id = Nat32.fromNat(nextReviewId);
    nextReviewId += 1;
    let review = {
      id;
      author = caller;
      tutor;
      rating;
      text;
      timestamp = Time.now();
    };
    reviews.add(id, review);
    id;
  };

  public query ({ caller }) func getReviewsForTutor(tutor : Principal) : async [Review] {
    // Public read access - no authentication required
    let allReviews = reviews.values().toArray();
    allReviews.filter<Review>(func(rev) { rev.tutor == tutor }).sort();
  };

  // Bookmarks
  public shared ({ caller }) func addBookmark(itemId : Nat32) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bookmarks");
    };
    let currentBookmarks = switch (bookmarks.get(caller)) {
      case (null) { List.empty<Nat32>() };
      case (?bookmarked) { bookmarked };
    };
    currentBookmarks.add(itemId);
    bookmarks.add(caller, currentBookmarks);
  };

  public query ({ caller }) func getBookmarks(user : Principal) : async [Nat32] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookmarks");
    };
    // Users can only view their own bookmarks unless they are admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookmarks or admin access required");
    };
    switch (bookmarks.get(user)) {
      case (null) { [] };
      case (?bookmarked) { bookmarked.toArray().sort() };
    };
  };

  // Search
  public query ({ caller }) func searchNotesByTitle(queryText : Text) : async [StudyNote] {
    // Public read access - no authentication required
    let allNotes = studyNotes.values().toArray();
    allNotes.filter<StudyNote>(func(note) {
      note.title.contains(#text queryText);
    }).sort();
  };

  // Claim initial admin (NEW FEATURE)
  public shared ({ caller }) func claimInitialAdmin() : async Text {
    // Check if caller is anonymous
    if (caller.isAnonymous()) {
      Runtime.trap("Must be logged in to claim admin");
    };

    // Check if admin has already been assigned
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin has already been assigned");
    };

    // Assign admin role to caller
    AccessControl.assignRole(accessControlState, caller, caller, #admin);

    "Admin access granted";
  };

  // Admin status
  public query ({ caller }) func getAdminStatus() : async Bool {
    accessControlState.adminAssigned;
  };

  // Add more utility functions as needed
};
