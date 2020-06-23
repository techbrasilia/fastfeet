import * as Yup from 'yup';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (!req.query || req.query.q === '' || req.query.q === undefined) {
      const deliverymen = await Deliveryman.findAll({
        order: ['id'],
        limit: 10,
        offset: (page - 1) * 10,
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      const total = await Deliveryman.count();

      return res.json({ dados: deliverymen, count: total });
    }

    const deliverymen = await Deliveryman.findAll({
      where: {
        name: { [Op.iLike]: `%${req.query.q}%` },
      },
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    const total = await Deliveryman.count();

    return res.json({ dados: deliverymen, count: total });
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: { id },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required().min(3),
      email: Yup.string().email().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ message: 'Deliveryman already exists' });
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({ where: { email } });

      if (deliverymanExists) {
        return res
          .status(401)
          .json({ error: 'Deliveryman already exists for this email.' });
      }
    }

    await deliveryman.update(req.body);

    return res.json(deliveryman);
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res
        .status(400)
        .json({ message: 'Delivery man does not exist', description: '' });
    }

    const totalDelivery = await Delivery.count({
      where: { deliveryman_id: deliveryman.id },
    });

    if (totalDelivery > 0) {
      return res.status(400).json({
        message: 'Entregador não pode ser excluído.',
        description: 'Há encomendas cadastradas para esse entregador.',
      });
    }

    try {
      await deliveryman.destroy();
    } catch (err) {
      return res.json({ error: err });
    }
    return res.json({ message: ' Delivery man successfully deleted' });
  }
}

export default new DeliverymanController();
