export type Status = "Pending" | "In Progress" | "Completed" | "Overdue";

export type Assignee = { id?: string; name: string; initials: string; color: string };

export type Task = {
  id: number;
  title: string;
  status: Status;
  description?: string | null;
  due?: string | null;         // ISO date
  category?: string;
  assignees?: Assignee[];
  ownerId?: string | null;
  teamId?: string | null;
};
