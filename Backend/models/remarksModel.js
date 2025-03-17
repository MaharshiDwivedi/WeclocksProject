const connection = require('../Config/Connection');

const Remarks = connection.define("tbl_new_smc_nirnay_remarks", {
  nirnay_remarks_record: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previous_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  disable_edit_delete: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  sync_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

<<<<<<< HEAD
module.exports = Remarks; // ✅ Fix: Properly export the model
=======
module.exports = Remarks; // ✅ Fix: Properly export the model
>>>>>>> 5d04b33ccdeca0e39c7bd1e2f381c74d906fb64b
