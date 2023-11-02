const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String },
  password: { type: String },
  facebook_id: { type: String },
  google_id: { type: String },
  user_role: { type: String },
  phone: { type: String },
  sign_up_type: { type: String },
  status: { type: String },
  image: { type: String },

}, {
  collection: 'users'
})

module.exports = mongoose.model('User', userSchema)