// Goal: A straightforward process for requesting and approving/rejecting pet adoptions, combining user request views.
// Key Statuses:
// Pet: Available, Adopted, Withdrawn
// AdoptionRequest: Pending, Approved, Rejected, Withdrawn (by adopter)
// Flow:
// Request Initiation:
// Adopter (Logged In) views an Available pet on /pets/:petId.
// Clicks "Request to Adopt".
// A modal appears allowing an optional message.
// Adopter submits the request (Pet ID, Message).
// Backend: Creates AdoptionRequest (Status: Pending), notifies Lister (In-App + Email), notifies Adopter (In-App Confirmation).
// Viewing Requests (/my-requests Page - Combined):
// User (Logged In) visits this page.
// Section 1 (Received): Shows requests for pets listed by the current user. Displays Pet Name, Adopter Name, Date, Message, Request Status. Shows "Approve"/"Reject" buttons only for Pending requests.
// Section 2 (Sent): Shows requests made by the current user. Displays Pet Name, Lister Name, Date, Request Status, Current Pet Status. Shows "Withdraw Request" button only for Pending requests.
// Adopter Withdraws Request:
// Adopter clicks "Withdraw" on a Pending sent request.
// Backend: Updates AdoptionRequest status to Withdrawn. Notifies Lister (In-App).
// Lister Withdraws Pet:
// Lister clicks "Withdraw Listing" (e.g., on /my-listings or pet manage/detail page).
// Backend: Updates Pet status to Withdrawn. Finds all Pending requests for this pet, updates their status to Rejected. Notifies affected Adopters (In-App).
// Lister Actions on Request (Approve/Reject):
// Lister views a Pending received request.
// Clicks "Approve" or "Reject".
// If Reject:
// Backend: Updates AdoptionRequest status to Rejected. Notifies Adopter (In-App + Email).
// If Approve:
// (Optional Frontend Step: Collect meeting details/contact info from Lister).
// Backend:
// Updates target AdoptionRequest status to Approved.
// Immediately updates Pet status to Adopted.
// Finds all other Pending requests for this pet and updates their status to Rejected.
// Notifies Approved Adopter (In-App + Email, including any collected details).
// Notifies Other Rejected Adopters (In-App + Email - Pet Adopted).
// Handling Failed Offline Adoption (Manual Re-list):
// If the offline meeting/handover doesn't work out after a request was Approved (and Pet marked Adopted):
// The Lister must manually go to the Pet's management/detail page.
// Click "Re-list Pet".
// Backend: Updates Pet status back to Available. Finds the previously Approved request and updates its status to Rejected. (Optional: Notify previously approved adopter). No automatic notification to others.