const baseUrl = require('../constant/url');
const services = require('../helper/service');
const cheerio = require('cheerio');

const fetchRecipes = (req, res, response) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('._recipes-list');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        element.find('.row');
        element.find('.col-12').each((i, e) => {
            title = $(e).find('.stretched-link').attr('data-tracking-value');
            thumb = $(e).find('.thumbnail').find('img').attr('data-src');
            duration = $(e).find('._recipe-features').find('.icon-clock').next().text();
            servings = $(e).find('.icon_fire').text();
            servings = servings.replace(/\s+/g, ' ').trim();
            difficulty = $(e).find('.icon_difficulty').text();
            // Contoh teks yang dinamis
            // Definisikan pola regex untuk mencocokkan teks yang dinamis
            if(difficulty === null || difficulty.trim() === ''){
                difficulty = 'Tidak diketahui';
            }else{
                difficulty = difficulty.replace(/\s+/g, ' ').trim();
            }

            url = $(e).find('.stretched-link').attr('href');
            href = url.split('/');
            key = href[4];
            console.log(key);

            recipe_list.push({
                title: title,
                thumb: thumb,
                key: key,
                times: duration,
                serving: servings,
                difficulty: difficulty
            });
        });
        console.log('fetch new recipes');
        //console.log(recipe_list.length);
        res.send({
            method: req.method,
            status: true,
            results: recipe_list
        });
    } catch (error) {
        throw error;
    }
}

const limiterRecipes = (req, res, response, limiter) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('#category-content');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        element.find('.category-posts');

        element.find('.post-col').each((i, e) => {
            title = $(e).find('.block-link').attr('data-tracking-value');
            thumb = $(e).find('.thumb-wrapper').find('img').attr('data-lazy-src');
            duration = $(e).find('.time').find('small').text();
            servings = $(e).find('.servings').find('small').text();
            difficulty = $(e).find('.difficulty').find('small').text();
            url = $(e).find('a').attr('href');
            href = url.split('/');
            key = href[4];

            recipe_list.push({
                title: title,
                thumb: thumb,
                key: key,
                times: duration,
                serving: servings,
                difficulty: difficulty
            });

        });

        const recipes_limit = recipe_list.splice(0, limiter);
        console.log('limiter');
        if (limiter > 10) {
            res.send({
                method: req.method,
                status: false,
                message: 'oops , you fetch a exceeded of limit, please set a limit below of 10',
                results: null
            });
        } else {
            res.send({
                method: req.method,
                status: true,
                results: recipes_limit
            });
        }
    } catch (error) {
        throw error;
    }
}

const Controller = {
    newRecipes: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep/`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    newRecipesByPage: async (req, res) => {
        try {
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep/page/${page}`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    category: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep/`, res);
            const $ = cheerio.load(response.data);
            const element = $('#menu-item-287');
            let category, url, key;
            let category_list = [];
            element.find('.sub-menu');
            element.find('li').each((i, e) => {
                // image = $(e).find('.bg-medium').

                category = $(e).find('a').attr('title');
                url = $(e).find('a').attr('href');
                const split = category.split(' ');
                if (split.includes('Menu')) split.splice(0, 1);
                const results = Array.from(split).join('-');
                key = $(e).find('a').attr('href').split('/');
                key = key[key.length - 2];
                category_list.push({
                    category: category,
                    url: url,
                    key: key
                });
            });

            return res.send({
                method: req.method,
                status: true,
                results: category_list
            });

        } catch (error) {
            throw error;
        }
    },

    article: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/artikel/`, res);
            const $ = cheerio.load(response.data);
            const element = $('._articles-list');
            let parse;
            let title, url;
            let article_lists = [];
            element.find('.row');
            element.find('.col-12').each((i, e) => {
                title = $(e).find('a').attr('data-tracking-value');
                url = $(e).find('a').attr('href');
                parse = url.split('/');
                console.log(parse.length);
                article_lists.push({
                    title: title,
                    url: url,
                    key: parse[3]
                });
            });

            return res.send({
                method: req.method,
                status: true,
                results: article_lists
            });
        } catch (error) {
            throw error;
        }
    },

    recipesByCategory: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep/${key}`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    recipesCategoryByPage: async (req, res) => {
        try {
            const key = req.params.key;
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep/${key}/page/${page}`, res);
            return fetchRecipes(req, res, response);

        } catch (error) {
            throw error;
        }
    },

    recipesDetail: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep/${key}`, res);
            const $ = cheerio.load(response.data);
            let metaDuration, metaServings, metaDificulty, metaIngredient;
            let title, thumb, user, datePublished, desc, quantity, ingredient, ingredients;
            let parseDuration, parseServings, parseDificulty, parseIngredient;
            let duration, servings, difficulty;
            let servingsArr = [];
            let difficultyArr = [];
            let object = {};
            const elementHeader = $('._recipe-header');
            const elementDesc = $('._rich-content').first();
            const elementNeeded = $('._product-popup'); //belum
            const elementIngredients = $('._recipe-ingredients');
            const elementTutorial = $('._recipe-steps');
            title = elementHeader.find('._section-title').text();
            title = title.replace(/\s+/g, ' ').trim();
            thumb = elementHeader.find('.lazyloaded').attr('data-src');
            if (thumb === undefined) {
                thumb = null;
            }
            const parts = elementHeader.find('.author').text().replace(/\s+/g, ' ').trim().split('|');
            user = parts[0];
            datePublished = parts[1];
            metaDuration = elementHeader.find('.icon-clock').next().text();
                metaServings = elementHeader.find('.icon_fire').text();
                metaServings = metaServings.replace(/\s+/g, ' ').trim();
                metaDificulty = elementHeader.find('.icon_difficulty').text();
                metaDificulty = metaDificulty.replace(/\s+/g, ' ').trim();
                if (metaDuration.includes('\n') && metaServings.includes('\n') && metaDificulty.includes('\n')) {
                    parseDuration = metaDuration.split('\n')[1].split(' ');
                    parseDuration.forEach(r => {
                        if (r !== "") duration = r;
                    });

                    parseServings = metaServings.split('\n')[1].split(' ');
                    parseServings.forEach(r => {
                        if (r !== "") servingsArr.push(r);
                    });
                    servings = Array.from(servingsArr).join(' ');
                    parseDificulty = metaDificulty.split('\n')[1].split(' ');
                    parseDificulty.forEach(r => {
                        if (r !== "") difficultyArr.push(r);
                    });
                    difficulty = Array.from(difficultyArr).join(' ');
                }

                object.title = title;
                object.thumb = thumb;
                object.servings = servings;
                object.times = duration;
                object.difficulty = difficulty;
                object.author = { user, datePublished };
                console.log(object);

            elementDesc.each((i, e) => {
                desc = $(e).find('p').text();
                object.desc = desc;
            });
            //belum
            let thumb_item, need_item;
            let neededArr = [];
            elementNeeded.find('.product-popup-items').find('.col-12').each((i, e) => {
                thumb_item = $(e).find('img').attr('data-src');
                need_item = $(e).find('.title').text();
                need_item = need_item.replace(/\s+/g, ' ').trim();
                neededArr.push({
                    item_name: need_item,
                    thumb_item: thumb_item
                });
            });

            object.needItem = neededArr;

            let ingredientsArr = [];
            elementIngredients.find('.d-flex').each((i, e) => {
                const term = [];
                quantity = $(e).find('.part').text();
                quantity = quantity.replace(/\s+/g, ' ').trim();
                metaIngredient = $(e).find('.item').text();
                metaIngredient = metaIngredient.replace(/\s+/g, ' ').trim();
                ingredient = Array.from(term).join(' ');
                ingredients = `${quantity} ${ingredient} ${metaIngredient}`
                ingredientsArr.push(ingredients)
            });

            object.ingredient = ingredientsArr;
            let step, resultStep;
            let stepArr = [];
            elementTutorial.find('.step').each((i, e) => {
                step = $(e).find('.content').find('p').text();
                resultStep = `${i + 1} ${step}`
                stepArr.push(resultStep);
            });

            object.step = stepArr;

            res.send({
                method: req.method,
                status: true,
                results: object
            });

        } catch (error) {
            throw error;
        }
    },

    searchRecipes: async (req, res) => {
        try {
            const query = req.query.q;
            console.log(query);
            const response = await services.fetchService(`${baseUrl}/?s=${query}`, res);
            const $ = cheerio.load(response.data);
            const element = $('._recipes-list');

            let title, url, key, thumb, duration, serving, difficulty;
            let search_list = [];
            element.find('.row').find('.col-12').each((i, e) => {
                title = $(e).find('.stretched-link').attr('data-tracking-value');
                url = $(e).find('a').attr('href').split('/');
                thumb = $(e).find('.thumbnail').find('img').last().attr('data-src');
                key = url[4];
                duration = $(e).find('._recipe-features').find('.icon-clock').next().text();
                serving = ""
                difficulty = $(e).find('._recipe-features').find('.icon_difficulty').text();
                difficulty = difficulty.replace(/\s+/g, ' ').trim();

                search_list.push({
                    title: title,
                    thumb: thumb,
                    key: key,
                    times: duration,
                    serving: serving,
                    difficulty: difficulty,
                });
                console.log(search_list.length);
            });

            const item = search_list.filter(result => result.title !== "");

            res.send({
                method: req.method,
                status: true,
                results: item
            });

        } catch (error) {
            throw error;
        }
    },

    articleCategory: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/artikel/`, res);
            const $ = cheerio.load(response.data);

            const element = $('._category-select ');
            let title, key;
            let article_category_list = [];
            element.find('.dropdown-menu').find('li').each((i, e) => {
                title = $(e).find('a').text();
                title = title.replace(/\s+/g, ' ').trim();
                key = $(e).find('a').attr('href').split('/');
                article_category_list.push({
                    title: title,
                    key: key[3]
                })
            });

            res.send({
                method: req.method,
                status: true,
                results: article_category_list
            });

        } catch (error) {
            throw error;
        }
    },

    articleByCategory: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/${key}`, res);

            const $ = cheerio.load(response.data);
            const element = $('._articles-list');
            let title, thumb, tags, keys;
            let article_list = [];
            element.find('.row').find('.col-12').each((i, e) => {
                title = $(e).find('a').attr('data-tracking-value');
                thumb = $(e).find('img').attr('data-src');
                tags = $(e).find('.post-info').find('small').text();
                keys = $(e).find('a').attr('href').split('/')
                article_list.push({
                    title: title,
                    thumb: thumb,
                    tags: tags,
                    key: keys[4]
                });
            });

            res.send({
                method: req.method,
                status: true,
                results: article_list
            });

        } catch (error) {
            throw error;
        }
    },

    articleDetails: async (req, res) => {
        try {
            const tag = req.params.tag;
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/${tag}/${key}`, res);

            const $ = cheerio.load(response.data);
            const element = $('#article-page');

            let title, thumbs, author, published, description;
            let article_object = {};
            title = element.find('.article-header').find('.title').text();
            author = element.find('.author').find('small').first().text();
            author = author.replace(/\s+/g, ' ').trim(); //edited
            published = element.find('.author').find('small').eq(1).text();
            published = published.replace(/\s+/g, ' ').trim();
            thumbs = element.find('._article-header').find('img').attr('data-src');

            element.find('._rich-content').each((i, e) => {
                description = $(e).find('p').text();
            });

            article_object.title = title;
            article_object.thumb = thumbs;
            article_object.author = author;
            article_object.date_published = published;
            article_object.description = description;

            res.send({
                method: req.method,
                status: true,
                results: article_object
            });

        } catch (error) {
            throw error;
        }
    },

    newRecipesLimit: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep/`, res);
            const limit = req.query.limit;
            return limiterRecipes(req, res, response, limit);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Controller;