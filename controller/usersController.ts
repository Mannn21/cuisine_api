import { Request, Response } from 'express';
import { HttpStatus, StatusText } from '../lib/statusEnum';
import response from '../utils/response';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Ambil data pengguna (misalnya dari database)
        const userData = users; // Contoh statis, ganti dengan data dari database

        // Kirim respons dengan data pengguna
        return response(
            HttpStatus.OK,
            StatusText.OK,
            userData,
            'Get all users success',
            res
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Tangani kesalahan dengan mengirimkan respons yang sesuai
            return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                StatusText.ERROR,
                null,
                `Error occurred: ${error.message}`,
                res
            );
        } else {
            // Jika tipe kesalahan tidak diketahui, tangani dengan respons generik
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

export default {getAllUsers};
