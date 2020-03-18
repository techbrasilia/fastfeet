import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';

const upload = multer(multerConfig);

const routes = new Router();

routes.get('/', async (req, res) => {
  return res.json({ ok: 'FastFeet' });
});

routes.get('/users', UserController.index);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

// Rotas de destinatarios
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

// Rotas de entregadores
routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

// Rotas de entregas

// criar um model e controller
// esse desafio não possui cadastro de users, fiz a listagem para treinar

export default routes;
