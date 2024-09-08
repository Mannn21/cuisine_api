import { Request, Response } from 'express';
import { doc, setDoc, collection, query, where, getDocs, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../src/firebase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpStatus, StatusText } from '../lib/statusEnum';
// import { TokenUserDataInterface } from '../src/interfaces/UserInterface';
// import { AuthInterface } from '../src/interfaces/AuthInterface';
import response from '../utils/response';
import { generateAccessToken } from '../utils/generateAccessToken';

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Invalid Input', res)

        const validEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!validEmail.test(email)) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Invalid Email', res)

        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, 'User not found', res);

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        const passwordCompared = await bcrypt.compare(password, userData.passwordHash);
        if (!passwordCompared) return response(HttpStatus.UNAUTHORIZED, StatusText.UNAUTHORIZED, null, 'Invalid password', res);

        const { id, name, email: userEmail } = userData;
        const tokenData = {
            id, name, email
        }
        const accessToken = generateAccessToken(tokenData);
        const secret = process.env.NODE_REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error("Environment variable NODE_ACCESS_TOKEN_SECRET is not defined");
        } 
        const refreshToken = jwt.sign(userData, secret, { expiresIn: '1d' })
        const expiredTime = new Date();
        expiredTime.setDate(expiredTime.getDate() + 1);
        
        const loginRef = doc(db, "auth", id);
        const loginDoc = await getDoc(loginRef);
        
        if (loginDoc.exists()) {
            await updateDoc(loginRef, { refreshToken, expiredTime });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return response(HttpStatus.OK, StatusText.OK, { accessToken }, 'Login successful', res);
        } else {
            await setDoc(loginRef, { name, userId: id, email: userEmail, refreshToken, expiredTime });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return response(HttpStatus.OK, StatusText.OK, { accessToken }, 'Login successful', res);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                StatusText.ERROR,
                null,
                `Error occurred: ${error.message}`,
                res
            );
        } else {
            return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                StatusText.ERROR,
                null,
                'An unknown error occurred',
                res
            );
        }
    }
};

export default { login };