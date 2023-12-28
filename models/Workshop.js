const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
  description: {
    type: String,
    required: true,
  },
  host: {
    type: String,
  },
  requirements: {
    type: String, 
  },
});

const Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop;
