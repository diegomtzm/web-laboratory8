let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let blogPostSchema = mongoose.Schema({
    id : { type : String,
          required : true },
    title : { type : String },
    content : { type : String },
    author : { type : String },
    publishDate : { type : Date }
});

let BlogPost = mongoose.model('BlogPost', blogPostSchema);

let BlogPostList = {
    get : function() {
        return BlogPost.find()
            .then(posts => {
                return posts;
            })
            .catch(err => {
                throw Error(err);
            });
    },
    getById : function(id) {
        return BlogPost.findOne({id : id})
            .then(post => {
                return post;
            })
            .catch(err => {
                throw Error(err);
            });
    },
    getByAuthor : function(author) {
        return BlogPost.find({author : author})
            .then(posts => {
                return posts;
            })
            .catch(err => {
                throw Error(err);
            });
    },
    post : function(newPost) {
        return BlogPost.create(newPost)
            .then(post => {
                return post;
            })
            .catch(err => {
                throw Error(err);
            });
    },
    delete : function(id) {
        return BlogPostList.getById(id)
            .then(post => {
                if (post) {
                    return BlogPost.findOneAndDelete({id : id})
                        .then(deletedPost => {
                            return deletedPost;
                        })
                        .catch(err => {
                            throw Error(err);
                        });
                } else {
                    throw Error("404 Id not found");
                }
            })
            .catch(err => {
                throw Error(err);
            });
    },
    put : function(updatedPost) {
        return BlogPostList.getById(updatedPost.id)
            .then(post => {
                if (post) {
                    return BlogPost.findOneAndUpdate({id : post.id}, {$set : updatedPost}, {new : true})
                        .then(newPost => {
                            return newPost;
                        })
                        .catch(err => {
                            throw Error(err);
                        });
                } else {
                    throw Error("404 Id not found");
                }
            })
            .catch(err => {
                throw Error(err);
            });
    }
};

module.exports = { BlogPostList };