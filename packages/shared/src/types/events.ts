export interface ComplaintCreatedEvent {
  type: "complaint.created";
  payload: {
    complaintId: string;
    userId: string;
    description: string;
    location?: { lat: number; lng: number };
    createdAt: string;
  };
}

export interface ComplaintEnrichedEvent {
  type: "complaint.enriched";
  payload: {
    complaintId: string;
    category: string;
    priority: string;
    summary: string;
    duplicateOf: string | null;
    confidence: number;
  };
}

export interface ComplaintStatusChangedEvent {
  type: "complaint.status-changed";
  payload: {
    complaintId: string;
    userId: string;
    oldStatus: string;
    newStatus: string;
    changedAt: string;
  };
}

export type KafkaEvent =
  | ComplaintCreatedEvent
  | ComplaintEnrichedEvent
  | ComplaintStatusChangedEvent;
