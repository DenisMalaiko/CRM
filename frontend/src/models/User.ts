export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
}

export class User implements IUser {
  name: string;
  email: string;
  password: string;

  constructor() {
    this.name = '';
    this.email = '';
    this.password = '';
  }
}