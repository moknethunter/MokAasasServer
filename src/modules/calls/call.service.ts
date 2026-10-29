import { ClientConnection } from "../../ports/client-connection.js";
import { UserRepository } from "../../ports/auth.port.js";
import { logger } from "../../logger.js";

export class CallService {
  constructor(
    private connection: ClientConnection,
    private userRepo: UserRepository
  ) {}

  setup() {
    // التحقق من وجود الرقم قبل الاتصال
    this.connection.onMessage("call:initiate", async (data) => {
      const targetUser = await this.userRepo.findByPhone(data.target);
      if (!targetUser) {
        return this.connection.emitToUser(data.sender, "call:error", { message: "الرقم الذي تحاول الاتصال به ليس مسجلاً على الشبكة." });
      }
      this.connection.emitToUser(data.target, "call:incoming", { caller: data.sender, callerName: data.callerName });
    });

    this.connection.onMessage("call:accept", (data) => {
      this.connection.emitToUser(data.target, "call:accepted", { by: data.sender });
    });

    const webrtcEvents = ["webrtc:offer", "webrtc:answer", "webrtc:ice"];
    webrtcEvents.forEach((evt) => {
      this.connection.onMessage(evt, (data) => {
        this.connection.emitToUser(data.target, evt, data.payload);
      });
    });
  }
}
