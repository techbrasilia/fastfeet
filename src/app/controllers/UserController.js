import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
    });

    return res.json(users);
  }

  async update(req, res) {
    return res.json({ usuario: req.userId });
  }
}

export default new UserController();
