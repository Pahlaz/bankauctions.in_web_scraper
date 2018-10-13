const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var postDetails = new Schema({
  listingID: {
    type: Number,
    required: 'Please provide the listing ID'
  },
  Institution: String,
  institutionBranch: String,
  contactDetails: String,
  auctionDetails: String,
  borrowerName: String,
  propertyType: String,
  lotDetails: String,
  scheduleOfProperty: String,
  inspectionDetails: String,
  reservePrice: String,
  EMD: String,
  minimumIncrement: String,
  dateAndTimeOfAuction: String,
  endTimeOfAuction: String,
  Created_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postDetails);