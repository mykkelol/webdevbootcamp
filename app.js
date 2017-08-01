var bodyParser      = require("body-parser"),
mongoose            = require("mongoose"),
express             = require("express"),
expressSanitizer    = require("express-sanitizer"),
methodOverride      = require("method-override"),
app                 = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog", {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public')); // middleware function that serves the public directory with CSS, JS
app.use(methodOverride('_method'));
app.use(expressSanitizer()); // has to go AFTER bodyParser
app.set('view engine', 'ejs');

// MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model('Blog', blogSchema);

/*Blog.create({
   title: 'HELLO WORLD!',
   image: 'https://greenwichmeantime.com/static/app/world_clock/icon/world.svg',
   body: 'This world is full of imperfection and perfection can be constructed by sheer passion'
});
*/

// RESTFUL ROUTES
    // ROOT ROUTE - home page
    app.get(['/','/home'],function(req, res){
       res.redirect('/blogs');
    });

    // INDEX ROUTE - show all blogs
    app.get('/blogs', function(req, res){
       Blog.find({}, function(err, blogs){
           if (err){
                console.log(err);
           }
           else{
                res.render('index', {blogs:blogs});
           }
       })
    });

    // NEW ROUTE - form to create new blog
    app.get('/blogs/new', function(req, res){
       res.render('new'); 
    });
    
    // CREATE ROUTE - route for form to submit
    app.post('/blogs', function(req, res){
        // req.body is whatever that comes from a form, blog.body refers to the blog in new.ejs and its body
        req.body.blog.body = req.sanitize(req.body.blog.body);
        // create new blog
        Blog.create(req.body.blog, function(err, newBlog){
            if (err){
                res.render('new'); // render new again when attempt to create fails
            }
            else{
                res.redirect('/blogs');
            }
       }); 
    });
    
    // SHOW ROUTE - show a blog post that is clicked
    app.get('/blogs/:id', function(req, res){
        Blog.findById(req.params.id, function(err, foundBlog){
            if (err){
                res.redirect('/blog');
            }
            else{
                res.render('show', {blog:foundBlog});
            }
        });
    });
    
    // EDIT ROUTE - editting the blog
    app.get('/blogs/:id/edit', function(req, res) {
        Blog.findById(req.params.id, function(err, foundBlog){
           if (err){
                res.redirect('/blogs');
           } 
           else {
                res.render('edit', {blog: foundBlog});
           }
        });
    });
    
    // UPDATE ROUTE - update preexisting post with the edit route
        // note: could easily use put, but it adds division and meaning so when we see put.. we know it's updating somethin
    app.put('/blogs/:id/', function(req, res){
        req.body.blog.body = req.sanitize(req.body.blog.body);
        Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
            // findByIdAndUpdate(ID, new data, callback)
            if (err){
                res.redirect('/blogs');
            }
            else {
                res.redirect('/blogs/' + req.params.id);
            }
        });
    });
    
    // DELETE ROUTE - delete
    app.delete('/blogs/:id', function(req, res){
        // destroy blog
        Blog.findByIdAndRemove(req.params.id, function(err){
           if (err){
               res.redirect('/blogs');
           } 
           else {
               // redirect somewhere
               res.redirect('/blogs');
           }
        });
    });

    
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Blog server connected!');
});