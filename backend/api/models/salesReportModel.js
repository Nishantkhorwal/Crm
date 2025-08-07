import mongoose from "mongoose";

const SalesReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CrmUser",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  meetings: [
    {
      firmName: { type: String, required: true },
      ownerName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String },
      visitingCard: { type: String }, // URL/path of uploaded file
      teamSize: { type: Number },
      rera: { type: Boolean }, // true = Yes, false = No
      remark: { type: String },
      status: {
        type: String,
        enum: ["Interested", "Not Interested"],
        required: true,
      },
      followUps: [
        {
          date: { type: Date, required: true }, // Follow-up date
          remark: { type: String },             // Notes about this follow-up
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

  ],

  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CrmSalesReport", SalesReportSchema);
