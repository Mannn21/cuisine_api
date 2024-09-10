import { Request, Response } from 'express';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore"; 
import { Timestamp } from "firebase/firestore";
import { db } from '../src/firebase';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus, StatusText } from '../lib/statusEnum';
import { ProductInterface, PublicProductInterface } from '../src/interfaces/ProductInterface';
import response from '../utils/response';

const addProduct = async (req: Request, res: Response) => {
    try {
        const { name, category, quantity, price, description, image_url } = req.body;

        if(!name || !category || !quantity || !price) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Please complete the datas', res);

        const categoryQuery = query(collection(db, "category"), where("name", "==", category.toLowerCase()));
        const categorySnapshot = await getDocs(categoryQuery);
        if(categorySnapshot.empty) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, 'Category is undefined', res);
        
        const productQuery = query(collection(db, "products"), where("name", "==", name.toLowerCase()));
        const productSnapShot = await getDocs(productQuery);
        if(!productSnapShot.empty) return response(HttpStatus.CONFLICT, StatusText.CONFLICT, null, 'Data is already registered', res);

        let categoryId = "";
        categorySnapshot.forEach((doc) => {
            categoryId = doc.id;
        });

        const productId = uuidv4();
        if(categoryId === "") return response(HttpStatus.INTERNAL_SERVER_ERROR, StatusText.INTERNAL_SERVER_ERROR, null, "Category id is undefined", res);

        const newProduct: ProductInterface = {
            id: productId,
            name: name.toLowerCase(),
            categoryId,
            imageUrl: image_url ? image_url : "",
            price,
            quantity,
            description
        }
        
        await setDoc(doc(db, "products", productId), newProduct);
        return response(HttpStatus.CREATED, StatusText.CREATED, newProduct, 'Create product success', res)

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

const getAllProducts = async (req: Request, res: Response) => {
    try {
        const getAllCategory = await getDocs(collection(db, "category"));

        const categoryMap: { [id: string]: string } = {};
        getAllCategory.forEach(doc => {
            const data = doc.data();
            categoryMap[doc.id] = data.name;
        });
        
        const getAllProducts = await getDocs(collection(db, "products"));

        const datas: PublicProductInterface[] = [];
        getAllProducts.forEach(doc => {
            const data = doc.data();
            const categoryName = categoryMap[data.categoryId] || "Unknown";

            datas.push({
                id: data.id,
                name: data.name,
                category: categoryName,
                imageUrl: data.imageUrl,
                price: data.price,
                quantity: data.quantity,
                description: data.description
            });
        });
		
		if(datas.length < 1) {
			return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, 'Products not allowed', res);
		}
		if(datas.length >= 1) {
			return response(HttpStatus.OK, StatusText.OK, datas, 'Get products success', res);
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
}

const getProductById = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if(!docSnap.exists()) return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, 'Product not found', res);

        const getAllCategory = await getDocs(collection(db, "category"));
        
        const categoryMap: { [id: string]: string } = {};
        getAllCategory.forEach(doc => {
            const data = doc.data();
            categoryMap[doc.id] = data.name;
        });

        const productData = docSnap.data();
        const categoryName = categoryMap[productData.categoryId] || "Unknown";

        const product: PublicProductInterface = {
                id: productData.id,
                name: productData.name,
                category: categoryName,
                imageUrl: productData.imageUrl,
                price: productData.price,
                quantity: productData.quantity,
                description: productData.description
        }

        return response(HttpStatus.OK, StatusText.OK, product, 'Get product by id success', res);
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

const getProductsByCategory =  async (req: Request, res: Response) => {
    try {
        const categoryQuery = req.query.q as string;
        if(!categoryQuery) return response(HttpStatus.BAD_REQUEST, StatusText.BAD_REQUEST, null, "Products not found", res);

        const getAllCategory = await getDocs(collection(db, "category"));
        let categoryId: string = "";
        
        getAllCategory.forEach(doc => {
            const data = doc.data();
            if (data.name === categoryQuery) {
                categoryId = doc.id;
            }
        });

        if (!categoryId) {
            return response(HttpStatus.NOT_FOUND, StatusText.NOT_FOUND, null, "Category not found", res);
        }
        const productsQuery = query(collection(db, "products"), where("categoryId", "==", categoryId));
        const querySnapshot = await getDocs(productsQuery);
        
        const datas: PublicProductInterface[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();

            const product: PublicProductInterface = {
                id: doc.id,
                name: data.name,
                category: categoryQuery,
                imageUrl: data.imageUrl,
                price: data.price,
                quantity: data.quantity,
                description: data.description
            };
            datas.push(product);
        });
        
        return response(HttpStatus.OK, StatusText.OK, datas, 'Get product by id success', res);
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
// const getBestSellerProducts;
// const searchProducts;
// const updateProduct;
// const deleteProduct;

export default { addProduct, getAllProducts, getProductById, getProductsByCategory };
