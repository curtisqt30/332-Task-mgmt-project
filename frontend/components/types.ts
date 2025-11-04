export type Status = "Pending" | "In Progress" | "Completed" | "Overdue";

export type Assignee = { id?: string; name: string; initials: string; color: string };

export type Task = {
  id: number | string;
  title: string;
  status: Status;
  due?: string;         // ISO date
  category?: string;
  assignees?: Assignee[];
  ownerId?: string | null;
  teamId?: string | null;
};
