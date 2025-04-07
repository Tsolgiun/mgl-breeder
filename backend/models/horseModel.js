import mongoose from 'mongoose';

const horseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    birthPlace: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    microchip: {
      type: String,
      unique: true,
      sparse: true,
    },
    brand: {
      type: String,
    },
    color: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    breeder: {
      type: String,
      required: true,
    },
    registrationDate: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    parentage: {
      sire: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' },
      dam: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }
    },
    offspring: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse'
    }]
  },
  {
    timestamps: true,
  }
);

const Horse = mongoose.model('Horse', horseSchema);

export default Horse;
