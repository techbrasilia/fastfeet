import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (!req.query || req.query.q === '' || req.query.q === undefined) {
      const recipients = await Recipient.findAll({
        order: ['id'],
        limit: 10,
        offset: (page - 1) * 10,
      });

      const total = await Recipient.count();

      return res.json({ dados: recipients, count: total });
    }

    const recipients = await Recipient.findAll({
      where: {
        name: { [Op.iLike]: `%${req.query.q}%` },
      },
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 10,
    });

    const total = await Recipient.count();

    return res.json({ dados: recipients, count: total });
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    return res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required().min(3),
      rua: Yup.string().required().min(3),
      numero: Yup.string().required().min(1),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { name, rua, numero, complemento, estado, cidade, cep } = req.body;
    // console.log(req.body, req.userId);

    const recipient = await Recipient.create({
      name,
      rua,
      numero,
      complemento,
      estado,
      cidade,
      cep,
      user_id: req.userId,
    });

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      rua: Yup.string().min(3),
      numero: Yup.string().min(1),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    console.log('atualizacao: ', req.body);
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    await recipient.update(req.body);

    return res.json(recipient);
  }
}
export default new RecipientController();
