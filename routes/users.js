var express = require('express');
var router = express.Router();
var userController = require('../controllers/user.server.controller');

/* GET users listing. */
router.post('/signup', userController.signup);

router.post('/signin', userController.signin);

router.get('/logout/:id', userController.isAuth, userController.logout);

router.post('/refresh', userController.refresh);

router.get('/search/:name', userController.isAvailable);

router.get('/secure', userController.isAuth, function(req, res) {
    res.status(200).json({
        message: "You have access"
    });
});

router.get('/admin', userController.isAuth, userController.isAdmin, function(req, res) {
    res.status(200).json({
        message: "You have admin access"
    });
});

module.exports = router;
