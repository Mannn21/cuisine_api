import express from 'express';
import usersRouter from './users';
import authRouter from './auth';
import productsRouter from './products';
import categoryRouter from './category';

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/category', categoryRouter);

export default apiRouter;
