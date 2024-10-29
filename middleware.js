const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalURL;
        req.flash('error','you must be signed in before accessing anything');
        return res.redirect('/login');
    }
    next();
}

module.exports = {
    isLoggedIn,
};

/**due to some recent security improvements in the Passport.js version updates
 * the session now gets cleared after a successful login. 
 * This causes a problem with our returnTo redirect logic because we store the returnTo route path 
 * (i.e., the path where the user should be redirected back after login) in the session (req.session.returnTo), which gets cleared after a successful login.

To resolve this issue, we will use a middleware function to transfer the returnTo value from the session (req.session.returnTo)
 to the Express.js app res.locals object before the passport.authenticate() function is executed in the /login POST route. */

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}