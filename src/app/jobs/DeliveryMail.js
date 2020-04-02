import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail';
  }

  async handle({ data }) {
    const { delivery, deliveryman, recipient } = data;

    // console.log('A fila executou');

    // console.log(deliveryman);
    // console.log(recipient);

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda cadastrada',
      template: 'new_delivery',
      context: {
        deliveryman: deliveryman.name,
        product: delivery.product,
        delivery: delivery.id,
        recipient: recipient.name,
        rua: recipient.rua,
        numero: recipient.numero,
        complemento: recipient.complemento,
        estado: recipient.estado,
        cidade: recipient.cidade,
        cep: recipient.cep,
      },
    });
  }
}

export default new DeliveryMail();
