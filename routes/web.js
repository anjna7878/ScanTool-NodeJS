const express = require('express');
const router = express.Router();


let search = require('../controllers/SearchController')
let auth = require('../controllers/AuthController')

router.get('/', async (req, res) => {
    res.render('pages/index');
})

router.post('/sign_up', auth.sign_up)
router.post('/users', auth.users)
router.post('/sign_in', auth.sign_in)

router.get('/sign-in', (req, res) => {
    let sess = req.session;
    if (sess.user) {
        return res.redirect('/dashboard');
    }
    res.render('pages/sign-in');
})
router.get('/sign-up', (req, res) => {
    let sess = req.session;
    if (sess.user) {
        return res.redirect('/dashboard');
    }
    res.render('pages/sign-up');
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


router.post('/get_website_details', search.get_website_details);
router.post('/get_placement_details', search.get_placement_details);
router.post('/get_discovery_details', search.get_discovery_details);
router.post('/get_keyword_details', search.get_keyword_details);
router.post('/get_review_details', search.get_review_details);
router.post('/get_competitive_details', search.get_competitive_details);


// router.get('/dashboard', (req, res) => {
//     let sess = req.session;
//     if (sess.user) {
//         res.render('pages/dashboard');
//     }
//     return res.redirect('/');
// })
router.get('/dashboard', auth.dashboard)
router.post('/scan', search.search_data)
router.post('/save_set_score', search.save_set_score)
router.get('/scan/:id', search.scan_view)

module.exports = router;