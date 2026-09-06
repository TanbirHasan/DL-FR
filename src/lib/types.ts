export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: string;
  note: string | null;
  date: string;
  userId: string;
  categoryId: string;
  category?: Category;
  recurringExpenseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  year: number;
  month: number;
  total: number;
  byCategory: { categoryId: string; categoryName: string; total: number }[];
}

export interface Item {
  id: string;
  name: string;
  unit: string | null;
  /** Optional catalog unit price; drives auto-fill of list-item prices. */
  price: string | null;
  userId: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  isChecked: boolean;
  price: string | null;
  quantity: string | null;
  unit: string | null;
  shoppingListId: string;
  itemId: string;
  categoryId: string;
  category?: Category;
  expenseId: string | null;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  userId: string;
  items: ShoppingListItem[];
  createdAt: string;
}

export type ReminderType = "TASK" | "CALL";

export interface Reminder {
  id: string;
  title: string;
  notes: string | null;
  type: ReminderType;
  dueAt: string;
  notifyBefore: number;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  message: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface CreateExpensePayload {
  amount: number;
  note?: string;
  date: string;
  categoryId: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseQuery {
  month?: number;
  year?: number;
  categoryId?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface CreateShoppingListPayload {
  title: string;
  itemIds?: string[];
}

export interface CreateItemPayload {
  name: string;
  categoryId: string;
  unit?: string;
  price?: number;
}

export type UpdateItemPayload = Omit<Partial<CreateItemPayload>, "unit" | "price"> & {
  unit?: string | null;
  price?: number | null;
};

export interface AddShoppingListItemPayload {
  itemId: string;
  quantity?: number;
  price?: number;
}

export interface UpdateItemQuantityPayload {
  quantity: number | null;
}

export interface UpdateItemPricePayload {
  price: number | null;
}

export interface CompleteListPayload {
  items: { itemId: string; price?: number }[];
}

export interface CreateReminderPayload {
  title: string;
  notes?: string;
  type?: ReminderType;
  dueAt: string;
  notifyBefore?: number;
}

export type UpdateReminderPayload = Partial<CreateReminderPayload> & { isCompleted?: boolean };

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurringExpense {
  id: string;
  amount: string;
  note: string | null;
  categoryId: string;
  category?: Category;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextRunDate: string;
  endDate: string | null;
  isActive: boolean;
  /** DAILY-only: skip occurrences that land on a day in weekendDays. */
  skipWeekends: boolean;
  /** Weekday numbers treated as weekend, 0 = Sunday … 6 = Saturday. */
  weekendDays: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringExpensePayload {
  amount: number;
  note?: string;
  categoryId: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  skipWeekends?: boolean;
  weekendDays?: number[];
}

export interface UpdateRecurringExpensePayload {
  amount?: number;
  note?: string;
  categoryId?: string;
  endDate?: string | null;
  isActive?: boolean;
  skipWeekends?: boolean;
  weekendDays?: number[];
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export type DebtDirection = "LENT" | "BORROWED";

export interface Debt {
  id: string;
  personName: string;
  direction: DebtDirection;
  amount: string;
  note: string | null;
  date: string;
  isSettled: boolean;
  settledAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtPayload {
  personName: string;
  direction: DebtDirection;
  amount: number;
  note?: string;
  date: string;
}

export type UpdateDebtPayload = Partial<CreateDebtPayload> & { isSettled?: boolean };

export interface DebtQuery {
  settled?: boolean;
  direction?: DebtDirection;
}

export interface DebtSummary {
  totalOwedToMe: number;
  totalIOwe: number;
  net: number;
  byPerson: { personName: string; net: number }[];
}

export type JournalMood = "GREAT" | "GOOD" | "OKAY" | "LOW" | "STRESSED";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: JournalMood | null;
  entryDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryPayload {
  title: string;
  content: string;
  mood?: JournalMood;
  entryDate: string;
}

export type UpdateJournalEntryPayload = Partial<CreateJournalEntryPayload> & {
  mood?: JournalMood | null;
};

export interface JournalQuery {
  month?: number;
  year?: number;
}

export type HealthReminderType = "MEDICINE" | "DOCTOR" | "WATER" | "EXERCISE" | "OTHER";
export type HealthReminderFrequency = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface HealthReminder {
  id: string;
  title: string;
  notes: string | null;
  type: HealthReminderType;
  frequency: HealthReminderFrequency;
  dueAt: string;
  notifyBefore: number;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthReminderPayload {
  title: string;
  notes?: string;
  type: HealthReminderType;
  frequency?: HealthReminderFrequency;
  dueAt: string;
  notifyBefore?: number;
}

export type UpdateHealthReminderPayload = Partial<CreateHealthReminderPayload> & {
  isCompleted?: boolean;
};

export type DocumentType =
  | "PASSPORT"
  | "NID"
  | "INSURANCE"
  | "WARRANTY"
  | "LICENSE"
  | "CERTIFICATE"
  | "OTHER";

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  identifier: string | null;
  notes: string | null;
  issuer: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  reminderDate: string | null;
  storageLocation: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  title: string;
  type: DocumentType;
  identifier?: string;
  notes?: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  reminderDate?: string;
  storageLocation?: string;
}

export type JobApplicationStatus = "APPLIED" | "ASSESSMENT" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface JobApplication {
  id: string;
  companyName: string;
  role: string;
  jobUrl: string | null;
  /** Raw pasted job post — requirements, responsibilities, etc. */
  description: string | null;
  status: JobApplicationStatus;
  appliedDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobApplicationPayload {
  companyName: string;
  role: string;
  jobUrl?: string;
  description?: string;
  status?: JobApplicationStatus;
  appliedDate?: string;
}

export type UpdateJobApplicationPayload = Partial<
  Omit<CreateJobApplicationPayload, "jobUrl" | "description">
> & {
  jobUrl?: string | null;
  description?: string | null;
};

export interface JobApplicationQuery {
  status?: JobApplicationStatus;
}

export interface JobApplicationSummary {
  total: number;
  byStatus: Record<JobApplicationStatus, number>;
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload> & {
  identifier?: string | null;
  notes?: string | null;
  issuer?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  reminderDate?: string | null;
  storageLocation?: string | null;
};
