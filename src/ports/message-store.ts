export interface MessageRecord {
  id: string;
  senderId: string;
  targetId: string;
  content: string;
  createdAt: Date;
}

export interface MessageStore {
  getHistory(limit: number): Promise<MessageRecord[]>;
  saveMessage(senderId: string, targetId: string, content: string): Promise<MessageRecord>;
}
