import { Request, Response } from 'express';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore"; 
import { Timestamp } from "firebase/firestore";
import { db } from '../src/firebase';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus, StatusText } from '../lib/statusEnum';
import response from '../utils/response';
import { CategoryInterface } from '../src/interfaces/CategoryInterface';

const addCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if(!name) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, "Please input category name", res);

        const q = query(collection(db, "category"), where("name", "==", name.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty) return response(HttpStatus.CONFLICT, StatusText.CONFLICT, null, 'Category is already registered', res);

        const categoryId = uuidv4();
        
        const newCategory: CategoryInterface = {
            id: categoryId,
            name: name.toLowerCase()
        }
        await setDoc(doc(db, "category", categoryId), newCategory);
        return response(HttpStatus.CREATED, StatusText.CREATED, newCategory, 'Create category success', res)
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

export default { addCategory };
