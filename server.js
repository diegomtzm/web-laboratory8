let express = require('express');
let morgan = require('morgan');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let uuidv4 = require('uuid/v4');
let { BlogPostList } = require('./blog-post-model');
const { DATABASE_URL, PORT } = require('./config');

let app = express();
let jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(express.static("public"));
app.use(morgan("dev"));

app.get("/api/blog-posts", (req, res) => {
    BlogPostList.get()
        .then(posts => {
            return res.status(200).json(posts);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
		});
});

app.get("/api/blog-post", (req, res) => {
    let author = req.query.author;
    if(!author) {
        res.statusMessage = "Missing author field in query";
        return res.status(406).json({message: "Missing author field in query", status: 406});
    } 

    BlogPostList.getByAuthor(author)
        .then(posts => {
            if(posts) {
                return res.status(200).json(posts);
            } else {
                res.statusMessage = "Author not found";
                return res.status(404).json({message: "Author not found", status: 404});
            }
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});

app.post("/api/blog-posts", jsonParser, (req, res) => {
    let title = req.body.title;
    let content = req.body.content;
    let author = req.body.author;
    let date = req.body.publishDate;

    if(!title || !content || !author || !date) {
        res.statusMessage = "Missing field in body";
        return res.status(406).json({message: "Missing field in body", status: 406});
    } 
    
    let newPost = {
        id : uuidv4(),
        title : title,
        content : content,
        author : author,
        publishDate : date
    };

    BlogPostList.post(newPost)
        .then(post => {
            return res.status(201).json(post);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});

app.delete("/api/blog-posts/:id", (req, res) => {
    let reqId = req.params.id;

    BlogPostList.delete(reqId)
        .then(_ => {
            res.status(200).json({message: "Post deleted correctly", status: 200});
        })
        .catch(err => {
            if( err.message == 404 ) {
				return res.status(404).json({
					message: "Student not found in the list",
					status: 404
				});
			}
			else{
				res.statusMessage = "Something went wrong with the DB. Try again later.";
				return res.status( 500 ).json({
					status : 500,
					message : "Something went wrong with the DB. Try again later."
				})
			}
        });
});

app.put("/api/blog-posts/:id", jsonParser, (req, res) => {
    console.log(req.body);
    let bodyId = req.body.id;
    let title = req.body.title;
    let content = req.body.content;
    let author = req.body.author;
    let date = req.body.publishDate;
    let paramsId = req.params.id;

    if (!bodyId) {
        res.statusMessage = "Missing id field in body";
        return res.status(406).json({message: "Missing id field in body", status: 406});
    }

    if (paramsId != bodyId) {
        res.statusMessage = "Body and params Id do not match";
        return res.status(409).json({message: "Body and params Id do not match", status: 409});
    }

    let updatedPost = {id : paramsId};

    if (title) {
        updatedPost.title = title;
    }

    if (content) {
        updatedPost.content = content;
    }

    if (author) {
        updatedPost.author = author;
    }

    if (date) {
        updatedPost.date = date;
    }

    BlogPostList.put(updatedPost)
        .then(post => {
            return res.status(202).json(post);
        })
        .catch(err => {
            if( err.message == 404 ) {
				return res.status(404).json({
					message: "Student not found in the list",
					status: 404
				});
			}
			else{
				res.statusMessage = "Something went wrong with the DB. Try again later.";
				return res.status( 500 ).json({
					status : 500,
					message : "Something went wrong with the DB. Try again later."
				})
			}
        });
});

let server;

function runServer(port, databaseUrl) {
    return new Promise( (resolve, reject ) => {
        mongoose.connect(databaseUrl, response => {
            if (response) {
                return reject(response);
            } else {
                server = app.listen(port, () => {
                    console.log("Apps is running on port " + port);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    return reject(err);
                })
            }
        });
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log("Closing the server");
                server.close(err => {
                    if (err) {
                        return reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
}

runServer(PORT, DATABASE_URL)
    .catch(err => {
        console.log(err);
    });

module.exports = { app, runServer, closeServer };
