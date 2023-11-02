const pagespeedInsights = require('pagespeed-insights');
const psi = require('psi');
const axios = require('axios');
require('dotenv').config()
var dns = require("dns")
const sslChecker = require("ssl-checker");
let userSchema = require('../Models/user');
let scanSchema = require('../Models/scan');
const { create } = require('../Models/user');
 
exports.search_data = function (req, res) {
    (async () => {
        // await scanSchema.deleteMany();
        // return res.json(req.body);
        // yext api start 
        const address = req.body.address + " " + req.body.address_1 + " " + req.body.city + " " + req.body.state + " " + req.body.zipcode;
        const post_body = {
            "name": req.body.name,
            "address": address,
            "phone": req.body.phone
        }
        // return res.json(address);
        const headers = {
            'My-Custom-Header': 'foobar'
        };

        let jobId = 8312572;
        try {
            const get_jobid = await axios.post('https://api.yext.com/v2/accounts/me/scan?api_key=' + process.env.yext_api + '&v=20160822', post_body, { headers })
            let jobId = get_jobid.data.response.jobId;
        } catch (error) {
            console.log('jobId error', error)
        }
        console.log('jobId', jobId)

        let sess = req.session;
        // console.log('sess::', sess);
        let user_id = "";
        if (sess.user) {
            user_id = sess.user._id;
        }
        console.log('user_id::', user_id);
        const scan = await scanSchema.create({
            "user_id": user_id,
            "name": req.body.name,
            "address": address,
            "phone": req.body.phone,
            "website": req.body.website,
            "email": req.body.email,

            'mobile_score': 0,
            'desktop_score': 0,
            'avg_score': 0,
            'mobile_data': '',
            'desktop_data': '',

            'placement_data': '',

            'keywords': '',

            'total_review': 0,
            'rating': 0,

            'total': 0,
            'discovery_search': 0,
            'brand_search': 0,
            'direct_search': 0,
            'discovery_percentage': 0,
            'brand_percentage': 0,
            'direct_percentage': 0,

            'secure_array': '',
            'ssl_secure': '',

            "set_score": 0,
            "opportunity_count":0
        })

        return res.render('pages/loading', {
            body: req.body,
            jobId: jobId,
            address: address,
            scan: scan
        });
    })();
};

exports.get_website_details = async function (req, res) {
    try {
        // return res.json(req.body);
        // Get the PageSpeed Insights report for mobile
        const { data } = await psi(req.body.website,{
            key: process.env.google_place_api,
        });
        console.log('Speed score mobile:', data.lighthouseResult.categories.performance.score);

        // Get the PageSpeed Insights report for desktop
        const data2 = await psi(req.body.website, {
            key: process.env.google_place_api,
            // nokey: 'true',
            strategy: 'desktop'
        });
        console.log('Speed score desktop:', data2.data.lighthouseResult.categories.performance.score);

        const mobile_score = data.lighthouseResult.categories.performance.score * 100;
        const desktop_score = data2.data.lighthouseResult.categories.performance.score * 100;
        const avg_score = (mobile_score + desktop_score) / 2;

        console.log('mobile_score:', mobile_score);
        console.log('desktop_score:', desktop_score);
        console.log('avg_score:', avg_score);
        // console.log('mobile_data:', data.lighthouseResult.audits);
        // console.log('desktop_data:', data2.data.lighthouseResult.audits);
        

        const scan = await scanSchema.updateOne( 
            { "scan_id": req.body.scan_id },
            {
                mobile_score: mobile_score.toFixed(0),
                desktop_score: desktop_score.toFixed(0),
                avg_score: avg_score.toFixed(0)
            }
        )

        return res.render('ajax/website', {
            score: data.lighthouseResult.categories.performance.score,
            data: data.lighthouseResult.audits,
            // mobile_data: data.lighthouseResult.audits,
            // desktop_data: data2.data.lighthouseResult.audits,
            mobile_score: mobile_score.toFixed(0),
            desktop_score: desktop_score.toFixed(0),
            avg_score: avg_score.toFixed(0),
            body: req.body,
            success: true,
        });
    } catch (error) {
        return res.render('ajax/website', {
            error: "Something went wrong! " + error.message,
            success: false,
        });
    }
}

exports.get_placement_details = async function (req, res) {
    try {
        console.log('jobid', req.body.jobId)

        let jobId = req.body.jobId;
        console.log(jobId)

        const google = await axios.get('https://api.yext.com/v2/accounts/me/scan/' + jobId + '/' + process.env.sites + '?api_key=' + process.env.yext_api + '&v=' + process.env.yext_v_date);
        console.log('here');

        Array.prototype.move = function (from, to) {
            this.splice(to, 0, this.splice(from, 1)[0]);
        };
        google.data.response.move(37, 0);
        google.data.response.move(20, 1);
        google.data.response.move(4, 2);
        google.data.response.move(5, 3);

        console.log('google',google.data.response)

        const scan = await scanSchema.updateOne(
            { "scan_id": req.body.scan_id },
            { placement_data: JSON.stringify(google.data.response) }
        )

        return res.render('ajax/placement', {
            body: req.body,
            google: google,
            success: true,
        });
    } catch (error) {
        return res.render('ajax/placement', {
            error: "Something went wrong! " + error.message,
            success: false,
        });
    }
}

exports.get_discovery_details = async function (req, res) {
    try {
        // for direct search
        const result = await axios.get('https://api.semrush.com/?type=domain_rank&key=' + process.env.semrush_api + '&display_limit=3&export_columns=Ot,At&domain=' + req.body.website + '/&display_sort=po_asc&database=us');
        get_value = result.data.split(`\r\n`)[1];

        search_data = get_value.split(';');
        const discovery_search = search_data[0]; // get organic traffic for Discovery
        const brand_search = search_data[1]; // get adwrods traffic for branded

        const urlObject = new URL(req.body.website);
        const hostName = urlObject.hostname;
        console.log('hostName', hostName)

        const direct_result = await axios.get('https://api.semrush.com/analytics/ta/api/v3/summary?targets=' + hostName + '&export_columns=direct&key=' + process.env.semrush_api);
        console.log('direct_result', direct_result.data)
        const direct_search = direct_result.data.split(`\n`)[1]; // get direct traffic for direct

        console.log('direct_search', direct_search)
        console.log('discovery_search', discovery_search)
        console.log('brand_search', brand_search)

        total = Number(discovery_search) + Number(brand_search) + Number(direct_search);
        console.log('total', total)

        const discovery_percentage = Number(discovery_search) / Number(total) * 100;
        const brand_percentage = Number(brand_search) / Number(total) * 100;
        const direct_percentage = Number(direct_search) / Number(total) * 100;


        const scan = await scanSchema.updateOne(
            { "scan_id": req.body.scan_id },
            {
                total: total,
                discovery_search: discovery_search,
                brand_search: brand_search,
                direct_search: direct_search,
                discovery_percentage: discovery_percentage.toFixed(0),
                brand_percentage: brand_percentage.toFixed(0),
                direct_percentage: direct_percentage.toFixed(0),
            }
        )

        return res.render('ajax/discovery', {
            total: total,
            discovery_search: discovery_search,
            brand_search: brand_search,
            direct_search: direct_search,
            discovery_percentage: discovery_percentage.toFixed(0),
            brand_percentage: brand_percentage.toFixed(0),
            direct_percentage: direct_percentage.toFixed(0),
            success: true,
        });
    } catch (error) {
        return res.render('ajax/discovery', {
            error: "Something went wrong! " + error.message,
            success: false,
        });
    }
}

exports.get_keyword_details = async function (req, res) {
    try {
        const response = await axios.get('https://api.semrush.com/?type=domain_organic&key=' + process.env.semrush_api + '&display_limit=3&export_columns=Ph,Po&domain=' + req.body.website + '/&display_sort=po_asc&database=us');
        let ff = response.data.split(`\r\n`);
        let arr = [];
        ff.map(function (val, index) {
            let i = val.indexOf(";")
            arr.push({ key: val.substr(0, i), position: val.substr(i + 1) })
        })
        arr.shift()
        console.log('keyword array', arr)

        const scan = await scanSchema.updateOne(
            { "scan_id": req.body.scan_id },
            {
                keywords: JSON.stringify(arr)
            }
        )

        return res.render('ajax/keyword', {
            keywords: arr,
        })
    } catch (error) {
        return res.json("Something went wrong! " + error.message);
    }
}

exports.get_review_details = async function (req, res) {
    try {
        const jobId = req.body.jobId;
        console.log(jobId)

        const google = await axios.get('https://api.yext.com/v2/accounts/me/scan/' + jobId + '/GOOGLEPLACES,FACEBOOK,YAHOO,YELP?api_key=' + process.env.yext_api + '&v=' + process.env.yext_v_date);

        let total_review = 0; let rating = 0;
        google.data.response.forEach(function (site, key) {
            if (site.status != 'NO_MATCH') {
                total_review = total_review + Number(site.review_count);
                rating = rating + Number(site.review_rating);
            }
        });

        if (isNaN(total_review)) {
            total_review = 0;
        }

        if (isNaN(rating)) {
            rating = 0;
        }


        const scan = await scanSchema.updateOne(
            { "scan_id": req.body.scan_id },
            {
                total_review: total_review,
                rating: rating,
            }
        )

        return res.render('ajax/review', {
            body: req.body,
            google: google,
            total_review: total_review,
            rating: rating,
            success: true,
        });
    } catch (error) {
        return res.render('ajax/review', {
            error: "Something went wrong! " + error.message,
            success: false,
        });
    }
}

exports.get_competitive_details = async function (req, res) {
    try {
        const response = await axios.get('https://api.semrush.com/?type=domain_organic_organic&key=' + process.env.semrush_api + '&display_limit=2&export_columns=Dn,Sn&domain=' + req.body.website + '/&database=us');
        console.log('raw', response.data)
        let ff = response.data.split(`\r\n`);
        console.log('after break', ff)
        let arr = [];
        ff.map(function (val, index) {
            if (val != '') {
                arr.push({ domain: val })
            }
        })
        arr.shift()
        console.log('final array', arr)

        const urlObject = new URL(req.body.website);
        const hostName = urlObject.hostname;
        console.log('domain 1', hostName)
        console.log('domain 2', arr[0].domain)
        console.log('domain 3', arr[1].domain)

        let secure_array = [];
        const secure_1 = await sslChecker(hostName, { method: "GET", port: 443 });
        const secure_2 = await sslChecker(arr[0].domain, { method: "GET", port: 443 });
        const secure_3 = await sslChecker(arr[1].domain, { method: "GET", port: 443 });
        console.log(secure_1)
        let ssl_secure = 0;
        if (secure_1.valid) {
            ssl_secure = 1;
        }
        console.log('ssl_secure', ssl_secure)

        const data1 = await psi(req.body.website, { key: process.env.google_place_api,strategy: 'desktop' });
        const data2 = await psi(arr[0].domain, { key: process.env.google_place_api, strategy: 'desktop' });
        const data3 = await psi(arr[1].domain, { key: process.env.google_place_api, strategy: 'desktop' });

        const score_1 = data1.data.lighthouseResult.categories.performance.score;
        const score_2 = data2.data.lighthouseResult.categories.performance.score;
        const score_3 = data3.data.lighthouseResult.categories.performance.score;

        // const score_1 = score_2 = score_3 = '';
        // const secure_2 = secure_3 = '';
        secure_array.push({ name: req.body.name, address: req.body.address, url: hostName, secure: secure_1, score: score_1 })
        secure_array.push({ name: arr[0].domain, address: arr[0].domain, url: arr[0].domain, secure: secure_2, score: score_2 })
        secure_array.push({ name: arr[1].domain, address: arr[1].domain, url: arr[1].domain, secure: secure_3, score: score_3 })
        // console.log('secure_array', secure_array)

        // console.log('Speed score desktop:', data2.data.lighthouseResult.categories.performance.score);


        const scan = await scanSchema.updateOne(
            { "scan_id": req.body.scan_id },
            {
                secure_array: JSON.stringify(secure_array),
                ssl_secure: ssl_secure,
            }
        )

        return res.render('ajax/competitive', {
            competitive_website: arr,
            body: req.body,
            secure_array: secure_array,
            ssl_secure: ssl_secure,
            success: true,
        });
    } catch (error) {
        return res.render('ajax/competitive', {
            error: "Something went wrong! " + error.message,
            success: false,
        });
    }
} 

exports.save_set_score = async function (req, res) {
    try{
        const scan = await scanSchema.updateOne(
            {"scan_id": req.body.scan_id},
            {
                "set_score": req.body.set_score,
                "opportunity_count": req.body.opportunity_count
            }
        )
        console.log('scan update',scan)
        return res.json(scan);
    } catch (error) {
        console.log('scan error',error.message)
        return res.json(error.message);
    }
}
 
exports.scan_view = async function (req,res){
    try {
        const scan = await scanSchema.findOne({'_id':req.params.id});

        // console.log('scan', JSON.parse(scan.placement_data));
        // return res.json(JSON.parse(scan.placement_data))
        return res.render('pages/scan_view', {
            body: req.body,
            scan: scan
        });
    } catch (error) {
        return res.status(422).send(error);
    }
}