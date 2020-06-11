import Sequelize, { Model } from 'sequelize';

class Delivery extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        entregue: {
          type: Sequelize.VIRTUAL,
          get() {
            return this.end_date !== null;
          },
        },
        cancelada: {
          type: Sequelize.VIRTUAL,
          get() {
            return this.canceled_at !== null;
          },
        },
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at) {
              return 'Cancelada';
            }
            if (this.start_date && !this.end_date) {
              return 'Retirada';
            }
            if (!this.start_date && !this.end_date) {
              return 'Pendente';
            }
            if (this.start_date && this.end_date) {
              return 'Entregue';
            }
            return null;
          },
        },
      },
      {
        tableName: 'delivery',
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Recipient, { foreignKey: 'recipient_id' });
    this.belongsTo(models.Deliveryman, { foreignKey: 'deliveryman_id' });
    this.belongsTo(models.File, { foreignKey: 'signature_id' });
  }
}

export default Delivery;
