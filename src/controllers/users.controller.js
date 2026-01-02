const db = require('../models');
const Usuario = db.Usuario;
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['senha'] },
      order: [['data_criacao', 'DESC']]
    });

    res.status(200).json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(200).json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nome, email, senha, admin } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
    }

    const emailExiste = await Usuario.findOne({ where: { email } });
    if (emailExiste) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      admin: !!admin
    });

    const { senha: _, ...usuarioSemSenha } = novoUsuario.toJSON();

    res.status(201).json(usuarioSemSenha);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
};

exports.update = async (req, res) => {
  try {
    const { nome, email, senha, admin } = req.body;

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    let senhaAtualizada = usuario.senha;
    if (senha) {
      senhaAtualizada = await bcrypt.hash(senha, 10);
    }

    await usuario.update({
      nome,
      email,
      senha: senhaAtualizada,
      admin
    });

    const { senha: _, ...usuarioSemSenha } = usuario.toJSON();

    res.status(200).json(usuarioSemSenha);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
};

exports.remove = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await usuario.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
};

exports.search = async (req, res) => {
  try {
    const termo = req.query.q;
    if (!termo) {
      return res.status(400).json({ erro: 'Termo de busca ausente' });
    }

    const usuarios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { nome: { [Op.like]: `%${termo}%` } },
          { email: { [Op.like]: `%${termo}%` } }
        ]
      },
      attributes: { exclude: ['senha'] }
    });

    res.status(200).json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
};
