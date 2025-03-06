// controllers/FundController.js
const FundModel = require("../models/FundModel");

class FundController {
  static async getFundDistribution(req, res) {
    try {
      const fundData = await FundModel.getFundDistribution();
      res.status(200).json(fundData);
    } catch (error) {
      console.error("Error fetching fund distribution:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch fund distribution data" });
    }
  }

  static async getAllSchools(req, res) {
    try {
      const schools = await FundModel.getAllSchools();
      res.status(200).json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  }

  static async addFundDistribution(req, res) {
    try {
      const { school_id, year, amount } = req.body;
      await FundModel.addFundDistribution(school_id, year, amount);
      res.status(201).json({ message: "Fund added successfully" });
    } catch (error) {
      console.error("Error adding fund:", error);
      res.status(500).json({ message: "Failed to add fund" });
    }
  }

  static async deleteFund(req, res) {
    try {
      const { id } = req.params;
      await FundModel.deleteFund(id);
      res.status(200).json({ message: "Fund deleted successfully" });
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  }
  static async updateFund(req, res) {
    try {
      const { id } = req.params;
      const { additional_amount } = req.body; // Change to receive additional_amount instead
      
      // Get current fund data
      const currentFund = await FundModel.getFundById(id);
      if (!currentFund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      // Extract existing values
      const [school_id, year, currentAmount] = currentFund.demand_master_record.split('|');
      const newAmount = parseFloat(currentAmount) + parseFloat(additional_amount);
      
      await FundModel.updateFund(id, school_id, year, newAmount);
      res.status(200).json({ message: "Fund updated successfully" });
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  }
}

module.exports = FundController;
