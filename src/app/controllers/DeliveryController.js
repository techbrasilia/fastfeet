import * as Yup from 'yup';
import { Op } from 'sequelize';
import Queue from '../../lib/Queue';

import Delivery from '../models/Delivery';
import DeliveryMail from '../jobs/DeliveryMail';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (!req.query || req.query.q === '' || req.query.q === undefined) {
      const deliveries = await Delivery.findAll({
        order: [['id']],
        limit: 10,
        offset: (page - 1) * 10,
        include: [
          {
            model: Deliveryman,
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          },
          {
            model: Recipient,
          },
          {
            model: File,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      const total = await Delivery.count();

      return res.json({ dados: deliveries, count: total });
    }

    const deliveries = await Delivery.findAll({
      where: {
        product: { [Op.iLike]: `%${req.query.q}%` },
      },
      order: [['id']],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Deliveryman,
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    const total = await Delivery.count();

    return res.json({ dados: deliveries, count: total });
  }

  async show(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findOne({
      where: {
        id,
      },
      order: [['id', 'DESC']],
      include: [
        {
          model: Deliveryman,
        },
        {
          model: Recipient,
        },

        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(delivery);
  }

  async update(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    await delivery.update(req.body);

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().min(3).required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const delivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    const deliveryman = await Deliveryman.findByPk(delivery.deliveryman_id);
    const recipient = await Recipient.findByPk(delivery.recipient_id);

    await Queue.add(DeliveryMail.key, {
      delivery,
      deliveryman,
      recipient,
    });

    return res.json(delivery);
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Encomenda não encontrada.' });
    }

    if (delivery.start_date || delivery.canceled_at) {
      return res
        .status(400)
        .json({ error: 'A encomenda não pode ser excluída.' });
    }

    await delivery.destroy();

    return res.status(200).json({ success: 'Encomenda deletada com sucesso' });
  }
}
export default new DeliveryController();
