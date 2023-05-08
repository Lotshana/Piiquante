const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.signup = (req, res, next) => {
    const isPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/; // Format du mot de passe exigé
    if(req.body.password.match(isPassword)) {
        bcrypt.hash(req.body.password, 10)
          .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({error}));
          })
          .catch(error => res.status(500).json({error}));
    } else {
        res.status(401).json({
            message: "Votre mot de passe doit contenir entre 8 et 20 caractères, avec au moins 1 lettre en capital et 1 chiffre"
        });
    }
};

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({message: 'Utilisateur créé !'}))
            .catch(error => res.status(400).json({error}));
      })
      .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (!user) {
            return res.status(401).json({message: 'Paire login/mot de passe incorrecte'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).json({message: 'Paire login/mot de passe incorrecte !'});
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    {userId: user._id},
                    process.env.TOKEN_ENCODED,
                    {expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({error})); 
    })
    .catch(error => res.status(500).json({error}));
};