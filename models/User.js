const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const zoneSchema = new Schema({
  title: { type: String, required: true }, // Lokasyon başlığı
  coordinates: {
    latitude: { type: Number, required: true }, // Enlem
    longitude: { type: Number, required: true } // Boylam
  },
  zoneRadius: { type: Number, required: true } // Çemberin yarıçapı (metre cinsinden)
});

const logSchema = new Schema({
  action: { type: String, required: true }, // Yapılan işlem (örn: "okula geldi", "evden çıktı")
  date: { type: Date, default: Date.now } // İşlemin yapıldığı zaman
});

const subscriptionSchema = new Schema({
  isActive: { type: Boolean, default: false }, // Abonelik durumu
  expirationDate: { type: Date }, // Aboneliğin bitiş tarihi
  paymentId: { type: String, required: true }, // Ödeme bilgisi için kullanılacak ID
  lastPaymentDate: { type: Date }, // Son ödeme tarihi
  paymentMethod: { type: String, required: true } // Ödeme yöntemi (örn: "Apple", "Google")
});

const followingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Takip edilen kullanıcı ID'si
  nickname: { type: String, required: true } // Takip edilen kullanıcı için takma ad
});

const userSchema = new Schema({
  deviceId: { type: String, required: true, unique: true }, // Cihaz ID'si (örn: UUID)
  code: { type: String, required: true, unique: true }, // Kullanıcı kodu
  zones: [zoneSchema], // Kullanıcının belirlediği lokasyon çemberleri
  currentLocation: { // Kullanıcının mevcut konumu
    latitude: { type: Number, required: true }, // Mevcut enlem
    longitude: { type: Number, required: true }, // Mevcut boylam
    timestamp: { type: Date, default: Date.now } // Konum güncellenme zamanı
  },
  following: [followingSchema], // Takip ettiğim kullanıcılar ve takma adları
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Beni takip eden kullanıcılar
  visibility: { type: Boolean, default: true }, // Kullanıcının görünürlük durumu
  logs: [logSchema], // Kullanıcının yaptığı işlemler
  subscription: subscriptionSchema // Kullanıcının abonelik bilgileri
});

const User = mongoose.model("User", userSchema);

module.exports = User;