const connection = require('../Config/Connection');
const { DataTypes } = require('sequelize');

// Model for remarks table
const Remarks = connection.define("tbl_new_smc_nirnay_remarks", {
  nirnay_remarks_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Active",
  },
  sync_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Model for demand master table
const DemandMaster = connection.define("tbl_demand_master", {
  demand_master_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  demand_master_record: {
    type: DataTypes.STRING,
    allowNull: false
  },
  demand_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending"
  },
  demanded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  active_reject_record: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Active"
  },
  ins_date_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  update_date_time_record: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = { Remarks, DemandMaster };