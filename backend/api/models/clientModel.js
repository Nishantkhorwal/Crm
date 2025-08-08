import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  remark: {
    type: String,
    required: true,
  }
});

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  source: String,              // e.g., Website, Instagram
  leadDated: Date,             // Lead received date
  phone: String,
  email: String,
  status: {
  type: String,
  enum: [
    'New',
    'Unassigned',
    'Closed',
    'Follow Up',
    'Time Given',
    'Not Interested',
    'Details shared on WA',
    'Call Again',
    'Call not Picked',
    'Broker',
    'Already Talking to someone',
    'Phone Off',
    'Phone not reachable',
    'Filled by Mistake',
    'SV Scheduled',
    'SV Did not happen',
    'SV Done',
    'Low Budget',
    'Duplicate Lead',
    'Other Lead',
    'Pravasa Lead'
  ],
  default: 'Unassigned',
},

  lastRemark: String,
  nextTaskDate: Date,
  interactions: [InteractionSchema], // history of all remarks & dates
  hotLead: {
  type: Boolean,
  default: false, 
},
  waSent: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrmUser',
    default: null,
  },
  assignedTo : {
    type : mongoose.Schema.Types.ObjectId,
    ref: 'CrmUser',
    default: null,

  },
  budget: {
    type: String,
    enum: [
      '50 lakh - 1 Cr',
      '1 Cr - 1.5',
      '1.5 Cr - 2.5',
      '2.5 Cr - 3.5',
      '3.5 Cr - 5',
      '5+'
    ],
    default: null,
  },

  location: {
    type: String,
    enum: [
      'Dwarka Expressway',
      'Huda Sec',
      'New Gurgaon',
      'Spr road',
      'Golf Course Extension',
      'Sohna'
    ],
    default: null,
  },
  requirement: String,


}, {
  timestamps: true // adds createdAt and updatedAt
});

const CrmClient = mongoose.model('CrmClient', ClientSchema);

export default CrmClient;
