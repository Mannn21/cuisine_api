import express from 'express';
import usersRouter from './users';
// import productsRouter from './products'; // Mengimpor router dari folder products

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);
// apiRouter.use('/products', productsRouter);

export default apiRouter;
