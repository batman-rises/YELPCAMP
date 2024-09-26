module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}//to prevent using try-catch everytime