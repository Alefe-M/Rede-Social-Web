const { error } = require('node:console');
const Post = require('../models/Post');

exports.createPost = async (req, res) => {
   try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    // ESTA LINHA É A CHAVE: ela vai nos dizer o que o Mongo não gostou
    res.status(400).json({ error: "Erro ao criar o post"}); 
  }
   
   
    // try{
   //     const newPost = new Post(req.body);
   //     const savedPost = await newPpost.save();
   //     res.status(201).json(savedPost);
   // } catch (err) {
   //     res.status(400).json({ error: err.message"});
   // }
};

exports.getFeed = async (req , res) => {
    try{
        const posts = await Post.find().sort({ createdAt: -1});
        res.status(200).json(posts);
    } catch{
        res.status(500).json({ error: "Erro ao buscar o feed"});
    }
};