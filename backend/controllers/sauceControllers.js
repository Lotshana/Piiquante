const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => res.status(201).json({message: 'Sauce eenregistrée !'}))
  .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
      .then(sauce => {
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'});
        } else {
          Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
          .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
          .catch(error => res.status(401).json({error}));
        }
      })
      .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then(sauce => {
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'})
        } else {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
              .then(() => res.status(200).json({message: 'Sauce supprimée )'}))
              .catch(error => res.status(401).json({error}));
          });
        }
      })
      .catch(error => res.status(500).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(404).json({error}));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({error}));
};

exports.likeOrDislikeSauce = (req, res, next) => {
  if (req.body.like === 1) {
    Sauce.updateOne(
      {_id: req.params.id},
      {
        $inc: {likes: +1},
        $push: {usersLiked: req.body.userId}
      })
    .then(sauces => res.status(200).json({message: 'Like ajouté'}))
    .catch(error => res.status(400).json({error}));
  }
  if (req.body.like === -1) {
    Sauce.updateOne(
      {_id: req.params.id},
      {
        $inc: {dislikes: +1},
        $push: {usersDisliked: req.body.userId}
      })
    .then(sauces => res.status(200).json({message: 'Dislike ajouté'}))
    .catch(error => res.status(400).json({error}));
  }
  if (req.body.like === 0) {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if (sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          {_id: req.params.id},
          {
            $inc: {likes: -1},
            $pull: {usersLiked: req.body.userId}
          })
        .then(sauces => res.status(200).json({message: 'Le like a bien été retiré'}))
        .catch(error => res.status(400).json({error}));
      }
      else if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          {_id: req.params.id},
          {
            $inc: {dislikes: -1},
            $pull: {usersDisiked: req.body.userId}
          })
        .then(sauces => res.status(200).json({message: 'Le dislike a bien été retiré'}))
        .catch(error => res.status(400).json({error}));
      }
    })
  }
};