import { Request, Response } from 'express';
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { Timestamp } from "firebase/firestore";
import { db } from '../src/firebase';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { HttpStatus, StatusText } from '../lib/statusEnum';
import { UserInterface, PublicUserInterface } from '../src/interfaces/UserInterface';
import { RoleUser } from '../lib/roleUsers';
import response from '../utils/response';

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const getAllDatas = await getDocs(collection(db, "users"));
		const datas: PublicUserInterface[] = [];
		getAllDatas.forEach(doc => {
			const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
            const birthDate = data.birthDate instanceof Timestamp ? data.birthDate.toDate() : data.birthDate;
            
            datas.push({
                name: data.name,
                email: data.email,
                address: data.address,
                createdAt: createdAt.toLocaleDateString(),
                id: doc.id,
                birthDate: birthDate.toLocaleDateString(),
                phoneNumber: data.phoneNumber,
                profileImageUrl: data.profileImageUrl,
            });
		});
		if(datas.length < 1) {
			return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, 'Users not allowed', res);
		}
		if(datas.length >= 1) {
			return response(HttpStatus.OK, StatusText.OK, datas, 'Get users success', res);
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

const addUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, confPassword } = req.body;
        if(password !== confPassword) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Password not compared', res)
        const validEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if(!validEmail.test(email)) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Invalid Email', res)
        
        const userId = uuidv4();
        const encrypttedPassword = await bcrypt.hash(confPassword, 10);

        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return response(HttpStatus.CONFLICT, StatusText.CONFLICT, null, 'Email is already registered', res);
        }
        const newUser: UserInterface = {
            id: userId,
            name,
            email,
            passwordHash: encrypttedPassword,
            address: "",
            role: RoleUser.CLIENT,
            createdAt: new Date(),
            phoneNumber: '',
            profileImageUrl: '',
            birthDate: new Date()
        }
        await setDoc(doc(db, "users", userId), newUser);
        return response(HttpStatus.CREATED, StatusText.CREATED, newUser, 'Create user success', res)
    } catch (error) {
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

export default {getAllUsers, addUser};
