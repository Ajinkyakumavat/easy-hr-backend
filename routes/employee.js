const express = require('express')
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const { upload } = require('../middleware/fileupload');
const { newEmployees, getSingleEmployee, updateEmployee, deleteEmployee, myEmployees, allEmployees, allEmployeescsv } = require('../controllers/employeeControllers')

router.route('/employees/new').post(isAuthenticatedUser, newEmployees);
router.route('/employees/csv').post(upload.single("file"), isAuthenticatedUser, allEmployeescsv);
router.route('/employee/:id').get(isAuthenticatedUser, getSingleEmployee);
router.route('/employees/mylist').get(isAuthenticatedUser, myEmployees);
router.route('/admin/employee/allEmployees').get(isAuthenticatedUser, authorizeRoles('admin'), allEmployees)
router.route('/employee/:id').put(isAuthenticatedUser, updateEmployee).delete(isAuthenticatedUser, authorizeRoles('admin'), deleteEmployee);

module.exports = router;
