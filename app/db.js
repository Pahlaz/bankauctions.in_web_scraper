const mongoose = require('mongoose'),
      Post = require('./models/postDetails.js');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;

// for connecting database with specified URL
function connect(url) {
  mongoose.connect(url, { useNewUrlParser: true })
          .then( () => console.log("[DB] Connetion Established") )
          .catch( (error) => console.log(error) );
}

// for disconnecting the db connection
function disconnect() {
  mongoose.connection.close();
}

// for adding the post obj in the db
function addPost(obj) {
  var new_post = new Post(obj);

  new_post.save()
    .then(data => {
      console.log("Post added successfully");
    })
    .catch(error => {
      console.log("Can't able to added post");
    });
}

// check if post already exist in database or not
async function isPostExist(listingID) {
  var post = await Post.find({listingID: listingID});

  if(post != '')
    return true;
  
  return false;
}

exports.connect = connect;
exports.disconnect = disconnect;
exports.addPost = addPost;
exports.isPostExist = isPostExist;