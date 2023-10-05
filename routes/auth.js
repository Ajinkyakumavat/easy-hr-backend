const express = require('express')
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth')
const {
    registerUser, loginUser, logout,
    forgotPassword, resetPassword, currentUser,
    updatePassword, updateProfile, allUsers,
    getUserDetails, updateUser, deleteUser
} = require('../controllers/authControllers')


router.route('/login').post(loginUser)
router.route('/logout').get(logout)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)

router.route('/currentUser').get(isAuthenticatedUser, currentUser)
router.route('/profile/update_password').put(isAuthenticatedUser, updatePassword)
router.route('/profile/edit_profile').put(isAuthenticatedUser, updateProfile)

router.route('/admin/register').post(isAuthenticatedUser, authorizeRoles('admin'),registerUser)
router.route('/admin/all_users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers)

router.route('/admin/users/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)

module.exports = router;
