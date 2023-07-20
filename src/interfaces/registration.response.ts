import { User } from "src/entities/user.entity";

export interface RegistrationResponse {
    message: string;
    token: string;
    user: User;
  }
  