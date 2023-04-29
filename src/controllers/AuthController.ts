import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import ApiError from '../utils/ApiError';
import User, { validateUser } from '../models/User';
import UserService from '../services/UserService';
import { generateActiveToken } from '../config/generateToken';
import { validateEmail } from '../utils/validate';
import sendMail from '../config/sendMail';
import { IDecodedActiveToken, IUser } from '../config/interface';

class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { error } = validateUser(req.body);
            if (error) {
                return next(new ApiError(400, error.details[0].message));
            }

            const user = await UserService.findOne({
                account: req.body.account,
            });
            if (user) {
                return next(
                    new ApiError(
                        400,
                        'User with given email already registered.'
                    )
                );
            }

            const hashedPassword = await bcrypt.hash(
                req.body.password,
                Number(process.env.SALT)
            );

            const newUser = {
                ...req.body,
                password: hashedPassword,
            };

            const active_token = generateActiveToken({ newUser });

            const url = `${process.env.CLIENT_URL}/active?token=${active_token}`;

            if (validateEmail(req.body.account)) {
                sendMail(req.body.account, url, 'Verify your email address');
                return res
                    .status(200)
                    .json({ message: 'Sucess! Please check your email.' });
            } else {
                const { new_user, token } = await UserService.createNewUser(
                    newUser
                );

                return res.status(200).json({
                    data: {
                        newUser: new_user,
                        token,
                    },
                    token,
                    message: 'Account created successfully!',
                });
            }
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async activeAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const { active_token } = req.body;

            const decoded = <IDecodedActiveToken>(
                jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)
            );

            const { newUser } = decoded;
            if (!newUser) {
                return next(new ApiError(400, 'Invalid authentication.'));
            }

            const user = await UserService.findOne({
                account: newUser.account,
            });
            if (user) {
                return next(
                    new ApiError(
                        400,
                        'User with given email already registered.'
                    )
                );
            }

            const { new_user, token } = await UserService.createNewUser(
                newUser
            );

            return res.status(200).json({
                data: { newUser: new_user, token },
                token,
                message: 'Account have been activated!',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            // console.log(req.body);

            const user = await User.findOne({
                account: req.body.account,
            });
            if (!user) {
                return res
                    .status(400)
                    .json({ message: 'Invalid account or password' });
            }

            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (!validPassword) {
                return res
                    .status(400)
                    .json({ message: 'Invalid account or password' });
            }

            const token = user.generateAuthToken();

            return res
                .status(200)
                .json({ data: token, token, message: 'Login sucessfully' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }
}

export default new AuthController();
