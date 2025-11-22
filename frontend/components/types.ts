export type Status = "Pending" | "In Progress" | "Completed" | "Overdue";

export type Assignee = { 
  id?: string; 
  name: string; 
  initials: string; 
  color: string;
};

export type Task = {
  id: number | string;  // Support both number and string IDs
  title: string;
  status: Status;
  description?: string | null;
  due?: string | null;         // ISO date format: "YYYY-MM-DD"
  category?: string;
  assignees?: Assignee[];
  ownerId?: string | null;
  teamId?: string | null;
};