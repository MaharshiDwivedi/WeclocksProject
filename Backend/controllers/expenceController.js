// controllers/smcController.js
const expenceModel = require('../models/expenceModel');

const expenceController = {
  // Existing method for monthly data (unchanged)
  async getData(req, res) {
    try {
      const { month, year, category_id, school_id } = req.body;

      const heads = await expenceModel.getActiveHeads();
      const niryan = await expenceModel.getActiveNiryan();
      const niryanRemarks = await expenceModel.getActiveNiryanRemarks();
      

      const response = heads.map(head => {
        const headId = head.head_id;

        const filteredNiryan = niryan.filter(n => {
          const parts = n.nirnay_reord.split('|');
          if (parts.length >= 12) {
            const date = new Date(parts[8]);
            const formattedMonth = date.getMonth() + 1;
            const formattedYear = date.getFullYear();

            const matches = (
              parts[11] == headId &&
              formattedMonth == parseInt(month) &&
              formattedYear == parseInt(year) &&
              (category_id == '4' ? parts[5] == school_id : true)
            );
            return matches;
          }
          return false;
        });

        const expectedCost = filteredNiryan.reduce((sum, n) => {
          const amount = Number(n.nirnay_reord.split('|')[3].trim());
          return sum + amount;
        }, 0);

        const filteredNiryanRemarks = niryanRemarks.filter(nr => {
          const parts = nr.nirnay_remarks_record.split('|');
          if (parts.length >= 9) {
            const date = new Date(nr.previous_date);
            const formattedMonth = date.getMonth() + 1;
            const formattedYear = date.getFullYear();

            const matches = (
              parts[7].trim() == headId &&
              formattedMonth == parseInt(month) &&
              formattedYear == parseInt(year) &&
              (category_id == '4' ? parts[2] === school_id : true)
            );
            return matches;
          }
          return false;
        });

        const actualCost = filteredNiryanRemarks.reduce((sum, nr) => {
          const parts = nr.nirnay_remarks_record.split('|');
          if (parts.length >= 7) {
            const amount = Number(parts[6]?.trim()) || 0;
            console.log(`Adding actualCost for head ${headId}: ${amount}`);
            return sum + amount;
          }
          return sum;
        }, 0);

        return {
          head_id: head.head_id,
          head_name: head.head_name,
          expected_cost: expectedCost,
          actual_cost: actualCost,
        };
      });

      res.status(200).json({
        success: true,
        data: response || [],
        message: 'Data fetched successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // New method for yearly data
  async getYearlyData(req, res) {
    try {
      const { year, school_id } = req.body;

      // Validate input
      if (!year || !school_id) {
        return res.status(400).json({
          success: false,
          message: 'Year and School ID are required'
        });
      }

      // Fetch active expense heads
      const heads = await expenceModel.getActiveHeads();

      // Fetch active niryan remarks
      const niryanRemarks = await expenceModel.getActiveNiryanRemarks();

      // Process data for each expense head
      const yearlyExpenseData = heads.map(head => {
        // Filter remarks for the specific year and school
        const filteredRemarks = niryanRemarks.filter(nr => {
          const parts = nr.nirnay_remarks_record.split('|');
          if (parts.length >= 9) {
            const date = new Date(nr.previous_date);
            const formattedYear = date.getFullYear();

            return (
              parts[7].trim() === head.head_id &&  // Head ID match
              formattedYear === Number(year) &&    // Year match
              parts[2] === school_id               // School ID match
            );
          }
          return false;
        });

        // Calculate total actual cost for the head
        const totalActualCost = filteredRemarks.reduce((sum, nr) => {
          const parts = nr.nirnay_remarks_record.split('|');
          if (parts.length >= 7) {
            const amount = Number(parts[6]?.trim()) || 0;  // 6th index is actual cost
            return sum + amount;
          }
          return sum;
        }, 0);

        return {
          head_id: head.head_id,
          head_name: head.head_name,
          actual_cost: totalActualCost
        };
      });

      // Calculate total expense
      const totalExpense = yearlyExpenseData.reduce((sum, head) => sum + head.actual_cost, 0);

      res.status(200).json({
        success: true,
        data: yearlyExpenseData,
        total_expense: totalExpense,
        message: 'Yearly expense data fetched successfully'
      });
    } catch (error) {
      console.error('Yearly Expense Data Error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal Server Error',
        details: error.message 
      });
    }
  }
};

module.exports = expenceController;