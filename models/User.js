const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const zoneSchema = new Schema({
  title: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true }, 
    longitude: { type: Number, required: true } 
  },
  zoneRadius: { type: Number, required: true } 
});

const logSchema = new Schema({
  action: { type: String, required: true },
  date: { type: Date, default: Date.now } 
});

const subscriptionSchema = new Schema({
  isActive: { type: Boolean, default: false },
  expirationDate: { type: Date },
  paymentId: { type: String, required: true },
  lastPaymentDate: { type: Date },
  paymentMethod: { type: String, required: true } 
});

const followingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  nickname: { type: String, required: true } 
});

const userSchema = new Schema({
  deviceId: { type: String, required: true, unique: true }, 
  code: { type: String, required: true, unique: true },
  zones: [zoneSchema], 
  currentLocation: {
    latitude: { type: Number, required: true }, 
    longitude: { type: Number, required: true }, 
    timestamp: { type: Date, default: Date.now } 
  },
  following: [followingSchema], 
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
  visibility: { type: Boolean, default: true }, 
  logs: [logSchema],
  subscription: subscriptionSchema,
  picture: {
    type: String,
    default:"https://i.ibb.co/6t34MRH/user.png"
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;