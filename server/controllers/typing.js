const mongoose = require('mongoose');
const Article = require('../models/article');
function main(req, res) {
    res.render('typing', {text: fetchText(), page: 'typingPage', title: "typing"})
}
function fetchText() {
    let text = "My son starts school today." +
        " It's going to be strange and new to him for a while, and I wish you would sort of treat him gently.";
    // " You see, up to now, he's been king of the roost. He's been boss of the backyard. I have always been around to repair his wounds, and to soothe his feelings. ";
    // "But now--things are going to be different. This morning, he's going to walk down the front steps, wave his hand and start on his great adventure that will probably include wars and tragedy and sorrow. To live his life in the world he has to live in will require faith and love and courage. So, W" +
    // "orld, I wish you would sort of take him by his young hand and teach him the things he will have to know. Teach him - but gently, if you can. Teach him that for every scoundrel there is a hero; that for every crooked politician there is a dedicated leader; that for every enemy there is a friend. Te";
    // "ach him the wonders of books. Give him quiet time to ponder the eternal mystery of birds in the sky, bees in the sun, and flowers on the green hill. Teach him it is far more honorable to fail than to cheat. Teach him to have faith in his own ideas, even if everyone tells him they are wrong. Teach him" +
    // " to sell his brawn and brains to the highest bidder, but never to put a price on his heart and soul. Teach him to close his ears to a howling mob...and to stand and fight if he thinks he's right. Teach him gently, World, but don't coddle him, because only the test of fire makes fine steel. This is a bi" +
    // "g order, World, but see what you can do. He's such a nice little fellow";
    return text;
}

function Node(text) {
    this.text = text;
    this.nodes = [];
}

function getArticleData(req, res) {
    Article.find({}, function (err, result) {
        if (err)
            throw err;
        let resArr = [];

        result.forEach(doc => {
            let node = new Node(doc.name);
            let counter = 1;
            doc.sub.forEach(content => node.nodes.push({text: counter++, href: content._id}));
            resArr.push(node);
        });

        res.json(resArr);
        // res.json([{text:"ha",href:"112233",nodes:[]}]);
    });
}

function getArticle(req, res) {

    //todo body parser
    Article.findOne(
        {"sub._id": mongoose.Types.ObjectId(req.body.id)},
        {"sub.$": true},
        function (err, article) {
            console.log(err);
            if (err) {
                console.log(err);
                res.json({});
                return;
            }
            // console.log(article.sub);
            res.json(
                {
                    text: article.sub[0].text,
                    charNum: article.sub[0].charNum,
                    articleId: article._id
                }
            );
        });
}
module.exports = {
    actionList: [
        {action: 'get', func: main, url: '/'},
        {action: 'get', func: getArticleData, url: '/getArticleData'},
        {action: 'post', func: getArticle, url: '/getArticle'}
    ]
};