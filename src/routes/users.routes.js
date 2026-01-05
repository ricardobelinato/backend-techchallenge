const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/users.controller');
const upload = require('../config/multer.config');

router.get('/', UsersController.getAll);
router.get('/search', UsersController.search);
router.get('/:id', UsersController.getById);
router.post('/', UsersController.create);
router.put('/:id', UsersController.update);
router.delete('/:id', UsersController.remove);

module.exports = router;
