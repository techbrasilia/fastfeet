import {
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  format,
  isBefore,
} from 'date-fns';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';

class DeliveryDeliverymanController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: req.body.deliveried
          ? {
              [Op.not]: null,
            }
          : null,
      },
      order: ['id'],
      include: [
        {
          model: Deliveryman,
        },
      ],
    });

    console.log(deliveries);

    return res.json(deliveries);
  }

  async update(req, res) {
    const horario = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ];
    const dataAtual = Number(new Date());

    const disponibilidade = horario.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(dataAtual, hour), minute),
        0
      );

      return {
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        disponibilidade: isAfter(value, dataAtual),
      };
    });

    const iniRetirada = new Date(disponibilidade[0].value);
    const fimRetirada = new Date(
      disponibilidade[disponibilidade.length - 1].value
    );

    if (isBefore(dataAtual, iniRetirada) || isAfter(dataAtual, fimRetirada)) {
      return res.json({ erro: 'Retiradas apenas das 08 às 18h' });
    }

    return res.json({ ok: 'salvar' });
  }
}
export default new DeliveryDeliverymanController();
