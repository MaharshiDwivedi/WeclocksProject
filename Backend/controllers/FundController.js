// controllers/FundController.js
const FundModel = require("../models/FundModel");

const FundController = {
  getFundDistribution: async (req, res) => {
    try {
      const fundData = await FundModel.getFundDistribution();
      res.status(200).json(fundData);
    } catch (error) {
      console.error("Error fetching fund distribution:", error);
      res.status(500).json({ message: "Failed to fetch fund distribution data" });
    }
  },

  getAllSchools: async (req, res) => {
    try {
      const schools = await FundModel.getAllSchools();
      res.status(200).json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  },

  addFundDistribution: async (req, res) => {
    try {
      const { school_id, year, amount } = req.body;

      // Check if fund already exists for this school and year
      const existingFund = await FundModel.checkExistingFund(school_id, year);
      
      if (existingFund) {
        // If fund exists, return a message indicating that the user should edit the existing record
        return res.status(409).json({ 
          message: "This school already has funds distributed for this year." 
        });
      }

      // If no existing fund, create new record
      await FundModel.addFundDistribution(school_id, year, amount);
      res.status(201).json({ message: "Fund added successfully" });
    } catch (error) {
      console.error("Error adding fund:", error);
      res.status(500).json({ message: "Failed to add fund" });
    }
  },

  deleteFund: async (req, res) => {
    try {
      const { id } = req.params;
      await FundModel.deleteFund(id);
      res.status(200).json({ message: "Fund deleted successfully" });
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  },

  updateFund: async (req, res) => {
    try {
      const { id } = req.params;
      const { additional_amount } = req.body;
      
      const currentFund = await FundModel.getFundById(id);
      if (!currentFund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      const [school_id, year, currentAmount] = currentFund.demand_master_record.split('|');
      const newAmount = parseFloat(currentAmount) + parseFloat(additional_amount);
      
      await FundModel.updateFund(id, school_id, year, newAmount);
      res.status(200).json({ message: "Fund updated successfully" });
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  }
};

module.exports = FundController;