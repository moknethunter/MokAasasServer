export interface MessageRecord {
  id: string;
  sender: string;
  content: string;
  createdAt: Date;
}

export interface MessageStore {
  getHistory(limit: number): Promise<MessageRecord[]>;
  saveMessage(sender: string, content: string): Promise<MessageRecord>;
}
