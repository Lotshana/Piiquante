const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-congif');

const sauceCtrl = require('../controllers/sauceControllers');

router.get('/', auth, sauceCtrl.getAllSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeOrDislikeSauce);

module.exports = router;