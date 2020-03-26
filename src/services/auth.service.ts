import { hash, compare } from 'bcryptjs';

import { sign } from '../config/jwtAuth';
import { User } from '../models/user.model';
import { MyError } from '../helpers/error.helper';
import { transErrors } from '../lang/vi';
import { UserService } from './user.service';
import { IAuthLogin, IAuthRegister } from '../interfaces/auth.interface';

export class AuthService {
    constructor() {}

    /**
     * This is function login
     * @param data
     */
    static async login(data: IAuthLogin): Promise<any> {
        const { email, password } = data;

        // Check if user exsist database
        const user = await UserService.findUserByEmail(email);
        if (!user) return false;

        // Check password
        const isMatch = await compare(password, user.password);
        if (!isMatch) return false;

        // Encode token
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        const token = await sign(payload);
        return token;
    }

    /**
     * This is function register
     * @param data
     */
    static async register(data: IAuthRegister): Promise<any> {
        const { email, password } = data;

        // Check if user exsist database
        const findUser = await UserService.findUserByEmail(email);
        if (findUser) throw new MyError(transErrors.auth.account_in_use, 400);

        // Generate password
        const hashPassword = await hash(password, 8);

        // Create user object
        let user = new User({ email, password: hashPassword });

        // Check if have one user exists database
        const checkExistsdatabase = UserService.checkUserExists();
        if (!checkExistsdatabase) user.isAdmin = true;

        // Save user database
        await user.save();

        // Return when complete reigster
        const userInfo = user.toObject();
        delete userInfo.password;
        return userInfo;
    }
}
