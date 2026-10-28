// Status vocabularies shared by admin screens. Tone drives the StatusBadge colour (always paired with text).

export const BOOKING_STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

export const BOOKING_STATUS_META = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "blue" },
  checked_in: { label: "Checked-in", tone: "green" },
  checked_out: { label: "Checked-out", tone: "gray" },
  cancelled: { label: "Cancelled", tone: "red" },
};

// UI hint only: the backend validates every transition and its error is shown to the user.
export const BOOKING_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
};

export const PAYMENT_STATUS_META = {
  unpaid: { label: "Unpaid", tone: "amber" },
  partial: { label: "Advance paid", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  failed: { label: "Failed", tone: "red" },
  refund_pending: { label: "Refund pending", tone: "amber" },
  refunded: { label: "Refunded", tone: "gray" },
};

export const ENQUIRY_STATUS_META = {
  new: { label: "New", tone: "amber" },
  read: { label: "Read", tone: "blue" },
  resolved: { label: "Resolved", tone: "green" },
};

export const REVIEW_STATUS_META = {
  pending: { label: "Pending", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  hidden: { label: "Hidden", tone: "gray" },
};

export const PUBLISH_STATUS_META = {
  true: { label: "Published", tone: "green" },
  false: { label: "Draft", tone: "gray" },
};

export const GALLERY_CATEGORIES = ["rooms", "property", "surroundings", "other"];
export const ATTRACTION_CATEGORIES = ["viewpoint", "monument", "temple", "beach", "other"];
