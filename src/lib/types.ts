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
}

export interface CreateShoppingListPayload {
  title: string;
  itemIds?: string[];
}

export interface CreateItemPayload {
  name: string;
  categoryId: string;
}

export type UpdateItemPayload = Partial<CreateItemPayload>;

export interface CompleteListPayload {
  items: { itemId: string; price: number }[];
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
}

export interface UpdateRecurringExpensePayload {
  amount?: number;
  note?: string;
  categoryId?: string;
  endDate?: string | null;
  isActive?: boolean;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
