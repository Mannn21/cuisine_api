import { Request, Response } from 'express';
import { doc, setDoc, collection, query, where, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { db } from '../src/firebase';
import bcrypt from 'bcrypt';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { HttpStatus, StatusText } from '../lib/statusEnum';
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
        } else {
            await setDoc(loginRef, { name, userId: id, email: userEmail, refreshToken, expiredTime });
        }
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        req.session.userId = id;
        return response(HttpStatus.OK, StatusText.OK, { accessToken }, 'Login successful', res);
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

const getRefreshToken = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        const refreshToken = req.cookies.refreshToken;

        if (!userId || !refreshToken) {
            return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Please login first', res);
        }

        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, 'User not found', res);
        }

        const authRef = doc(db, "auth", userId);
        const authSnap = await getDoc(authRef);
        if (!authSnap.exists()) {
            return response(HttpStatus.FORBIDDEN, StatusText.FORBIDDEN, null, 'Please login first', res);
        }

        const refreshSecret = process.env.NODE_REFRESH_TOKEN_SECRET;
        if (!refreshSecret) {
            return response(HttpStatus.INTERNAL_SERVER_ERROR, StatusText.ERROR, null, "Server error: missing token secret", res);
        }

        jwt.verify(refreshToken, refreshSecret, (err: VerifyErrors | null, decoded: any) => {
            if (err) {
                return response(HttpStatus.FORBIDDEN, StatusText.FORBIDDEN, null, "Invalid refresh token", res);
            }

            const accessSecret = process.env.NODE_ACCESS_TOKEN_SECRET;
            if (!accessSecret) {
                return response(HttpStatus.INTERNAL_SERVER_ERROR, StatusText.ERROR, null, "Server error: missing access token secret", res);
            }

            if (decoded && typeof decoded !== 'string' && 'email' in decoded) {
                const { email, name, userId } = decoded;

                const accessToken = jwt.sign({ name, email, userId }, accessSecret, { expiresIn: "20s" });
                return response(HttpStatus.OK, StatusText.OK, { accessToken }, "OK", res);
            } else {
                return response(HttpStatus.FORBIDDEN, StatusText.FORBIDDEN, null, "Invalid refresh token payload", res);
            }
        });
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

const logout = async (req: Request, res: Response) => {
    try {
        const { userId }  = req.session;
        if(!userId) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Please login first', res);

        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, 'User not found', res);
        }

        const authRef = doc(db, "auth", userId);
        const authSnap = await getDoc(authRef);
        if (!authSnap.exists()) {
            return response(HttpStatus.FORBIDDEN, StatusText.FORBIDDEN, null, 'Please login first', res);
        }

        await deleteDoc(doc(db, "auth", userId));
        req.session.destroy((err) => {
            if (err) {
                return response(HttpStatus.INTERNAL_SERVER_ERROR, StatusText.ERROR, null, 'Error occurred while logging out', res);
            }
            res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
            return response(HttpStatus.OK, StatusText.OK, null, 'Logout success', res);
        });
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
}

export default { login, getRefreshToken, logout };