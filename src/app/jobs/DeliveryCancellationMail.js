import Mail from '../../lib/Mail';

class DeliveryCancellationMail {
  get key() {
    return 'DeliveryCancellationMail';
  }

  async handle({ data }) {
    const { delivery, deliveryman, problem } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda cancelada',
      template: 'cancel_delivery',
      context: {
        deliveryman: deliveryman.name,
        product: delivery.product,
        delivery: problem.delivery_id,
        description: problem.description,
      },
    });
  }
}
export default new DeliveryCancellationMail();
