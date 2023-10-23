const router = require('express').Router();
const route = router;

const controller = require('../controller/index');

route.get('/', (req, res) => {
    res.send({
        greet : 'Hello there 👋',
        message : 'visit link on bellow for documentation about masak apa hari ini 👇',
        documentation : 'https://github.com/tomorisakura/unofficial-masakapahariini-api'
    });
});

route.get('/api', (req, res) => {
    res.send({
        method : req.method,
        message : 'Hello there 🌹',
        status : 'On Progress 🚀',
        lets_connected : {
            github : 'https://github.com/tomorisakura',
            dribbble : 'https://dribbble.com/grevimsx',
            deviantart : 'https://deviantart.com/hakureix'
        }
    });
});

route.get('/api/recipes', controller.newRecipes); //done 
route.get('/api/recipes/:page', controller.newRecipesByPage); //done
route.get('/api/recipes-length/', controller.newRecipesLimit); //done
route.get('/api/category/recipes', controller.category); //done
route.get('/api/articles/new', controller.article); //done
route.get('/api/category/recipes/:key', controller.recipesByCategory); //done
route.get('/api/category/recipes/:key/:page', controller.recipesCategoryByPage);  //done
route.get('/api/recipe/:key', controller.recipesDetail);
route.get('/api/search/', controller.searchRecipes); //done
route.get('/api/category/article', controller.articleCategory); //done
route.get('/api/category/article/:key', controller.articleByCategory); //done
route.get('/api/article/:tag/:key', controller.articleDetails); //done

route.get('*', (req, res) => {
    res.status(404).json({
        method : req.method,
        message : 'cant find spesific endpoint, please make sure you read a documentation',
        status : false,
        code : 401,
    });
});

module.exports = route;
