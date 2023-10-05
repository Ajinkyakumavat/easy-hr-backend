const express = require('express')
const router = express.Router();
const {isAuthenticatedUser} = require('../middleware/auth')

const {newTask,deleteTask,myTask} = require('../controllers/todoController')

router.route('/task/new').post(isAuthenticatedUser,newTask);
router.route('/task/myList').get(isAuthenticatedUser,myTask);
router.route('/task/delete/:id').delete(isAuthenticatedUser,deleteTask);

module.exports = router;
