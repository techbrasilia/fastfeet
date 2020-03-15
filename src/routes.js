import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';

const routes = new Router();

routes.get('/', async (req, res) => {
  return res.json({ ok: 'FastFeet' });
});

routes.get('/users', UserController.index);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
// criar rota para cadastrar/atualizar destinatarios
// criar um model e controller
// esse desafio não possui cadastro de users, fiz a listagem para treinar

export default routes;
