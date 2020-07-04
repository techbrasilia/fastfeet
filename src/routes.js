import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryDeliverymanController from './app/controllers/DeliveryDeliverymanController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

const upload = multer(multerConfig);

const routes = new Router();

routes.get('/', async (req, res) => {
  return res.json({ ok: 'FastFeet' });
});

routes.get('/users', UserController.index);

routes.post('/sessions', SessionController.store);
routes.get('/deliverymen/:id', DeliverymanController.show);

// Rotas de entregas por entregador
routes.get('/deliveryman/:id/deliveries', DeliveryDeliverymanController.index);
routes.put(
  '/deliveryman/:id/removal',
  upload.single('file'),
  DeliveryDeliverymanController.update
);

// Rota de cadastro de problemas
routes.post('/delivery/:id/problems', DeliveryProblemController.store);

// Rota de lista de problemas
routes.get('/delivery/:id?/problems', DeliveryProblemController.index);

routes.use(authMiddleware);

// Rotas de destinatarios
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients/:id', RecipientController.show);
routes.delete('/recipients/:id', RecipientController.delete);

routes.post('/files', upload.single('file'), FileController.store);

// Rotas de entregadores
routes.get('/deliverymen', DeliverymanController.index);

routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

// Rotas de entregas
routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

// Rotas problemas

routes.get('/problems/:id', DeliveryProblemController.show);

routes.delete('/problem/:id/cancel_delivery', DeliveryProblemController.update);

export default routes;
