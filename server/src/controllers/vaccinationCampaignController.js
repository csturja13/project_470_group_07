const VaccinationCampaign = require("../models/VaccinationCampaign");
const VaccinationBooking = require("../models/VaccinationBooking");

async function listCampaigns(req, res) {
  try {
    const { status, species } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (species) {
      filter.$or = [{ targetSpecies: species }, { targetSpecies: "All" }];
    }

    const campaigns = await VaccinationCampaign.find(filter)
      .sort({ campaignDate: 1 });

    return res.json(campaigns);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

async function createCampaign(req, res) {
  try {
    const {
      title,
      description,
      targetSpecies,
      vaccineName,
      location,
      organizer,
      campaignDate,
      lastRegistrationDate,
      availableSlots,
      status
    } = req.body;

    if (!title || !vaccineName || !location || !campaignDate) {
      return res.status(400).json({
        message: "title, vaccineName, location, campaignDate required"
      });
    }

    const campaign = await VaccinationCampaign.create({
      title,
      description: description || "",
      targetSpecies: targetSpecies || "All",
      vaccineName,
      location,
      organizer: organizer || "",
      campaignDate,
      lastRegistrationDate: lastRegistrationDate || null,
      availableSlots: Number(availableSlots || 0),
      status: status || "Upcoming",
      createdBy: req.user.userId
    });

    return res.status(201).json(campaign);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

// Admin: update campaign
async function updateCampaign(req, res) {
  try {
    const { id } = req.params;

    const updated = await VaccinationCampaign.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "The Campaign is not found" });
    }

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
}


async function deleteCampaign(req, res) {
  try {
    const { id } = req.params;

    const campaign = await VaccinationCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "The Campaign is not found" });
    }

    await campaign.deleteOne();
    return res.json({ message: "Campaign Deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
}


// User: book an appointment
async function bookCampaignAppointment(req, res) {
  try {
    const { id } = req.params;
    const { petName, animalType, ownerPhone, notes } = req.body;

    if (!petName || !animalType) {
      return res.status(400).json({
        message: "petName and animalType are required"
      });
    }

    const campaign = await VaccinationCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.availableSlots <= 0) {
      return res.status(400).json({ message: "No slots available" });
    }

    if (
      campaign.targetSpecies !== "All" &&
      campaign.targetSpecies !== animalType
    ) {
      return res.status(400).json({
        message: "This campaign is not available for the selected animal"
      });
    }

    const booking = await VaccinationBooking.create({
      campaign: campaign._id,
      user: req.user.userId,
      petName,
      animalType,
      ownerPhone: ownerPhone || "",
      notes: notes || ""
    });

    campaign.availableSlots = campaign.availableSlots - 1;
    await campaign.save();

    return res.status(201).json({
      message: "Appointment booked successfully",
      booking
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

// User: view my bookings
async function listMyBookings(req, res) {
  try {
    const bookings = await VaccinationBooking.find({
      user: req.user.userId
    })
      .populate("campaign")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}




module.exports = {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  bookCampaignAppointment,
  listMyBookings
};

