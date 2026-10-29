import { UserRepository, PasswordHasher, TokenService } from "../../ports/auth.port.js";

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private hasher: PasswordHasher,
    private tokenService: TokenService
  ) {}

  async register(username: string, password: string) {
    const existing = await this.userRepo.findByUsername(username);
    if (existing) throw new Error("اسم المستخدم موجود بالفعل");

    const passwordHash = await this.hasher.hash(password);
    const user = await this.userRepo.createUser(username, passwordHash);
    return this.tokenService.sign({ username: user.username, role: user.role });
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new Error("بيانات الدخول غير صحيحة");

    const isValid = await this.hasher.compare(password, user.passwordHash);
    if (!isValid) throw new Error("بيانات الدخول غير صحيحة");

    return this.tokenService.sign({ username: user.username, role: user.role });
  }
}
