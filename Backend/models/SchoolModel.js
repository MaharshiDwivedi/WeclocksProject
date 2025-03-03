
const connection = require('../Config/Connection');

class SchoolModel {
  static async getSchoolsWithSMC() {
    const query =  "SELECT school_id, school_name FROM tbl_schools WHERE status = 'Active'" ;
    const [rows] = await connection.query(query);
    return rows;
  }
}

module.exports = SchoolModel;