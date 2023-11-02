const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let scanSchema = new Schema({
    user_id: { type: String },
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    
    set_score: { type: String },
    opportunity_count: { type: String },

    mobile_score: { type: String },
    desktop_score: { type: String },
    avg_score: { type: String },
    mobile_data: { type: String },
    desktop_data: { type: String },

    placement_data: {type:String},

    keywords: {type:String},

    total_review: {type:String},
    rating: {type:String},


    total: {type:String},
    discovery_search: {type:String},
    brand_search: {type:String},
    direct_search: {type:String},
    discovery_percentage: {type:String},
    brand_percentage: {type:String},
    direct_percentage: {type:String},


    secure_array: {type:String},
    ssl_secure: {type:String},

    status: { type: String },
    image: { type: String },
}, {
    collection: 'scans'
})

module.exports = mongoose.model('scan', scanSchema)