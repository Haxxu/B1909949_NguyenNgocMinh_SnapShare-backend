import jwt from 'jsonwebtoken';

export const generateActiveToken = (payload: object) => {
    return jwt.sign(payload, `${process.env.ACTIVE_TOKEN_SECRET}`, {
        expiresIn: '5m',
    });
};
