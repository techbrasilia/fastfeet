import Queue from '../../lib/Queue';

import Delivery from '../models/Delivery';
import DeliveryMail from '../jobs/DeliveryMail';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class DeliveryController {
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
