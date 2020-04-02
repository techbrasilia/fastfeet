import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Queue from '../../lib/Queue';
import DeliveryCancellationMail from '../jobs/DeliveryCancellationMail';
import Deliveryman from '../models/Deliveryman';

class DeliveryProblemController {
  async index(req, res) {
    if (req.params.id) {
      const problems = await DeliveryProblem.findByPk(req.params.id);

      if (!problems || problems.length === 0) {
        return res.status(400).json({ message: 'Nenhum problema encontrado.' });
      }

      return res.json(problems);
    }

    const problems = await DeliveryProblem.findAll();

    if (!problems || problems.length === 0) {
      return res.status(400).json({ message: 'Nenhum problema encontrado.' });
    }

    return res.json(problems);
  }

  async store(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Entrega não encontrada.' });
    }

    const { description } = req.body;

    const problem = await DeliveryProblem.create({
      delivery_id: delivery.id,
      description,
    });

    return res.json(problem);
  }

  async update(req, res) {
    const problem = await DeliveryProblem.findByPk(req.params.id);

    if (!problem) {
      return res
        .status(400)
        .json({ error: 'Problem não encontrado para cancelar a entrega.' });
    }

    const delivery = await Delivery.findByPk(problem.delivery_id);

    delivery.update({ canceled_at: new Date() });

    const deliveryman = await Deliveryman.findByPk(delivery.deliveryman_id);

    await Queue.add(DeliveryCancellationMail.key, {
      delivery,
      deliveryman,
      problem,
    });

    return res.json(delivery);
  }
}
export default new DeliveryProblemController();
