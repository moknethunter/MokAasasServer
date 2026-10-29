import { UserRepository, PasswordHasher, TokenService } from "../../ports/auth.port.js";

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private hasher: PasswordHasher,
    private tokenService: TokenService
  ) {}

  async register(phoneNumber: string, username: string, password: string) {
    const existing = await this.userRepo.findByPhone(phoneNumber);
    if (existing) throw new Error("رقم الهاتف مسجل بالفعل على الشبكة");

    const passwordHash = await this.hasher.hash(password);
    const user = await this.userRepo.createUser(phoneNumber, username, passwordHash);
    return this.tokenService.sign({ phone: user.phoneNumber, name: user.username, role: user.role });
  }

  async login(phoneNumber: string, password: string) {
    const user = await this.userRepo.findByPhone(phoneNumber);
    if (!user) throw new Error("رقم الهاتف غير مسجل على الشبكة");

    const isValid = await this.hasher.compare(password, user.passwordHash);
    if (!isValid) throw new Error("كلمة المرور غير صحيحة");

    return this.tokenService.sign({ phone: user.phoneNumber, name: user.username, role: user.role });
  }
}
