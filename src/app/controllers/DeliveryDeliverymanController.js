import {
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  format,
  isBefore,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import File from '../models/File';

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
      order: [['id', 'DESC']],
      include: [
        {
          model: Deliveryman,
        },
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Entregador não existe.' });
    }

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

    /** Data da retirada da entrega == hoje */
    const dataAtual = Number(new Date());

    const disponibilidade = horario.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(dataAtual, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        disponibilidade: isAfter(value, dataAtual),
      };
    });

    const iniRetirada = new Date(disponibilidade[0].value);
    const fimRetirada = new Date(
      disponibilidade[disponibilidade.length - 1].value
    );

    /** Valida se a data/hora esta entre o horario permitido */
    if (isBefore(dataAtual, iniRetirada) || isAfter(dataAtual, fimRetirada)) {
      return res.status(401).json({
        error: `Retiradas apenas das ${disponibilidade[0].time} às ${
          disponibilidade[disponibilidade.length - 1].time
        }`,
      });
    }

    const { delivery_id, end_date } = req.query;

    const dataEntrega = Number(end_date);

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Entrega não encontrada.' });
    }
    /** Valida entregador da entrega e entregador da retirada */
    if (delivery.deliveryman_id !== deliveryman.id) {
      return res
        .status(401)
        .json({ error: 'Essa entrega não está disponível para você.' });
    }

    /** Verifica se é uma 'entrega de produto' e se foi retirado */
    if (dataEntrega) {
      if (!delivery.start_date) {
        return res
          .status(400)
          .json({ error: 'O produto não foi retirado para entrega.' });
      }

      if (delivery.end_date) {
        return res
          .status(400)
          .json({ error: 'O produto já foi entregue ao destinatário.' });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Você precisa enviar imagem do produto entregue.' });
      }

      const { originalname: name, filename: path } = req.file;

      const file = await File.create({
        name,
        path,
      });

      delivery.update({ end_date: dataEntrega, signature_id: file.id });
      return res.json({
        message: 'O produto foi entregue ao destinatário com sucesso!',
      });
    }

    /** Verifica se o produto ja foi 'retirado' */
    if (delivery.start_date) {
      return res
        .status(400)
        .json({ error: 'O produto já foi retirado para entrega.' });
    }

    /** Valida qtd de retiradas do dia */
    const qtdRetidadas = await Delivery.count({
      where: {
        deliveryman_id: deliveryman.id,
        start_date: {
          [Op.between]: [startOfDay(dataAtual), endOfDay(dataAtual)],
        },
      },
    });

    if (qtdRetidadas === 5) {
      return res
        .status(401)
        .json({ error: 'Limite de retiradas por dia já alcançado.' });
    }

    /** Realiza a retirada do produto */
    delivery.update({
      start_date: dataAtual,
    });

    return res.json({
      message: 'Produto retirado para entrega com sucesso!',
    });
  }
}
export default new DeliveryDeliverymanController();
