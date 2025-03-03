
const SchoolModel = require('../models/SchoolModel');

class SchoolController {
  static async getSchoolsWithSMC(req, res) {
    try {
      const schools = await SchoolModel.getSchoolsWithSMC();
      res.status(200).json(schools);
    } catch (error) {
      console.error('Error fetching schools:', error);
      res.status(500).json({ message: 'Failed to fetch schools' });
    }
  }
}

module.exports = SchoolController;