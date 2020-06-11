import { Op } from 'sequelize';
import Queue from '../../lib/Queue';

import Delivery from '../models/Delivery';
import DeliveryMail from '../jobs/DeliveryMail';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class DeliveryController {
  async index(req, res) {
    if (!req.query || req.query.q === '' || req.query.q === undefined) {
      const deliveries = await Delivery.findAll({
        order: [['id', 'DESC']],
        include: [
          {
            model: Deliveryman,
          },
          {
            model: Recipient,
          },
        ],
      });

      return res.json(deliveries);
    }

    const deliveries = await Delivery.findAll({
      where: {
        product: { [Op.iLike]: `%${req.query.q}%` },
      },
      order: [['id', 'DESC']],
      include: [
        {
          model: Deliveryman,
        },
        {
          model: Recipient,
        },
      ],
    });

    return res.json(deliveries);
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
      ],
    });

    return res.json(delivery);
  }

  async store(req, res) {
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
}
export default new DeliveryController();
