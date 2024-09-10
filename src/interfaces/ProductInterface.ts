export interface ProductInterface {
    id: string;
    name: string;
    categoryId: string;
    quantity: number;
    price: number;
    description?: string;
    imageUrl: string;
}

export interface PublicProductInterface {
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    imageUrl: string;
    description?: string;
}