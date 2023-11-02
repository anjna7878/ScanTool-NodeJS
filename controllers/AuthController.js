const { Validator } = require('node-input-validator');
const niv = require('node-input-validator');

let userSchema = require('../Models/user');
let scanSchema = require('../Models/scan');

const bcrypt = require('bcryptjs');

exports.sign_up = function (req, res) {
    niv.addCustomMessages({
        'password.minLength': 'The password must be at least 6 characters.',
    });
    const v = new Validator(req.body, {
        email: 'required|email',
        first_name: 'required',
        last_name: 'required',
        // password: "required|string|minLength:6|same:confirm_password",
        password: "required|string|minLength:6",
    });

    v.check().then(async (matched) => {
        if (!matched) {
            // v.errors.forEach(function (site, key) {
            //     console.log('site', site)
            //     console.log('key', key)
            // });
            return res.render('pages/sign-up', {
                error: "Wrong data"
            });
        } else {
            try {
                const exist_user = await userSchema.findOne({ email: req.body.email });
                if (exist_user) {
                    return res.render('pages/sign-up', {
                        error: 'Email Already Exist!'
                    });
                }
                const new_user = await userSchema.create({
                    "first_name": req.body.first_name,
                    "last_name": req.body.last_name,
                    "email": req.body.email,
                    "status": 'active',
                    "password": bcrypt.hashSync(req.body.password, 8),
                });
                req.session.user = new_user;
                return res.redirect('/dashboard');
            } catch (error) {
                console.log(error)
                return res.render('pages/sign-up', {
                    error: error
                });
            }
        }
    });
};

exports.sign_in = function (req, res) {
    const v = new Validator(req.body, {
        email: 'required|email',
        password: "required|string|minLength:6",
    });

    v.check().then(async (matched) => {
        if (!matched) {
            return res.redirect('/sign-in?error=Wrong Data!');
        } else {
            try {
                const exist_user = await userSchema.findOne({ email: req.body.email });
                if (exist_user) {
                    const match = bcrypt.compareSync(req.body.password, exist_user.password); // true
                    if (match) {
                        req.session.user = exist_user;
                        return res.redirect('/dashboard');
                    }
                    else {
                        return res.redirect('/sign-in?error=Wrong Pasosword!');
                        // return res.status(200).send("Wrong Password!");
                    }
                }
            } catch (error) {
                console.log(error)
                return res.redirect('/sign-in?error=' + error);
            }
        }
    });
}

exports.users = function (req, res) {
    userSchema.all((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
}


exports.dashboard = async function (req, res) {
    let sess = req.session;
    if (sess.user) {
        user_id = sess.user._id;
        const scans = await scanSchema.find({ user_id: user_id });
        console.log('scans', scans)
        return res.render('pages/dashboard', {
            scans: scans
        });
    }
    return res.redirect('/');
}
