const  Thought = require('../models/Thought');
const User = require('../models/User');



module.exports = {
    // get all thoughts
    getThought(req, res) {
        Thought.find()
            .then((thoughts) => res.json(thoughts))
            .catch((err) => res.status(500).json(err));
    },
    // get one thought by id
    getSingleThought(req, res) {
        Thought.findOne({ _id: req.params.id })
        .select('-__v')
        .then((thought) =>
            !thought
            ? res.status(404).json({ message: 'No thought found with this id!' })
            : res.json(thought)
        )
        .catch((err) => res.status(500).json(err));
    },
    // create thought
    createThought(req, res) {
        Thought.create(req.body)
        .then((thought) => {
            return User.findOneAndUpdate(
                { _id: req.body.userId },
                { $addToSet: { thoughts: thought._id } },
                { new: true }
            );  
        }).then((user) => 
            !user
            ? res.status(404).json({ 
                message: 'No user found with this id!', 
            })
            : res.json('Thought added!')
        )
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });    
    },
    // update thought by id
    updateThought(req, res) {
        Thought.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
        .then((thought) => {
            if (!thought) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(thought);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
    },
    // delete thought
    deleteThought(req, res) {
        Thought.findOneAndRemove({ _id: req.params.id })
        .then((thought) => {
            if (!thought) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            return User.findOneAndUpdate(
                { thoughts: req.params.thoughtId },
                { $pull: { thoughts: req.params.thoughtid } },
                { new: true }
            );
        })
        .then((user) => {
            if (!user) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            res.json({message: 'Thought deleted!'});
        })
        .catch((err) => res.status(500).json(err));
    },
    // add reaction
    addReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtid },
            { $addToSet: { reactions: req.body } },
            { new: true }
        )
        .then((thought) => {
            if (!thought) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(thought);
        })
        .catch((err) => res.status(500).json(err));
    },
    // remove reaction
    removeReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtid },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { new: true }
        )
        .then((thought) => res.json(thought))
        .catch((err) => res.status(500).json(err));
    }
};