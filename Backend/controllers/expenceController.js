// controllers/smcController.js
const expenceModel = require('../models/expenceModel');

const expenceController = {
    async getData(req, res) {
      try {
        const { month, year, category_id, school_id } = req.body;
        console.log("Request:", { month, year, category_id, school_id });
  
        const heads = await expenceModel.getActiveHeads();
        const niryan = await expenceModel.getActiveNiryan(); // Fetch tharav data
        const niryanRemarks = await expenceModel.getActiveNiryanRemarks(); // Fetch remarks data
  
        console.log("All Tharavs (niryan):", niryan);
        console.log("All Remarks (niryanRemarks):", niryanRemarks);
  
        const response = heads.map(head => {
          const headId = head.head_id;
  
          // Expected Cost (from tbl_new_smc_nirnay)
          const filteredNiryan = niryan.filter(n => {
            const parts = n.nirnay_reord.split('|');
            if (parts.length >= 12) {
              const date = new Date(parts[8]); // Insert date from tharav
              const formattedMonth = date.getMonth() + 1;
              const formattedYear = date.getFullYear();
  
              const matches = (
                parts[11] == headId && // head_id at index 11
                formattedMonth == parseInt(month) &&
                formattedYear == parseInt(year) &&
                (category_id == '4' ? parts[5] == school_id : true)
              );
              console.log(`Tharav: ${n.nirnay_reord}, Head: ${headId}, Month: ${formattedMonth}/${month}, Year: ${formattedYear}/${year}, School: ${parts[5]}/${school_id}, Matches: ${matches}`);
              return matches;
            }
            return false;
          });
  
          const expectedCost = filteredNiryan.reduce((sum, n) => {
            const amount = Number(n.nirnay_reord.split('|')[3].trim()); // expectedExpenditure at index 3
            console.log(`Adding expectedCost for head ${headId}: ${amount}`);
            return sum + amount;
          }, 0);
  
          // Actual Cost (from tbl_new_smc_nirnay_remarks)
          const filteredNiryanRemarks = niryanRemarks.filter(nr => {
            const parts = nr.nirnay_remarks_record.split('|');
            if (parts.length >= 9) {
              const date = new Date(nr.previous_date);
              const formattedMonth = date.getMonth() + 1;
              const formattedYear = date.getFullYear();
  
              const matches = (
                parts[7].trim() == headId && // head_id at index 7
                formattedMonth == parseInt(month) &&
                formattedYear == parseInt(year) &&
                (category_id == '4' ? parts[2] === school_id : true)
              );
              console.log(`Remark: ${nr.nirnay_remarks_record}, Previous Date: ${nr.previous_date}, Head: ${headId}, Month: ${formattedMonth}/${month}, Year: ${formattedYear}/${year}, School: ${parts[2]}/${school_id}, Matches: ${matches}`);
              return matches;
            }
            return false;
          });
  
        
const actualCost = filteredNiryanRemarks.reduce((sum, nr) => {
    // First try to use parsed data if available
    if (nr.parsedData && nr.parsedData.actualExpense) {
      return sum + (Number(nr.parsedData.actualExpense) || 0);
    }
    
    // Fallback to parsing the record string
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
  
        console.log("Response Data:", response);
        res.status(200).json({
          success: true,
          data: response || [],
          message: 'Data fetched successfully'
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
  
  module.exports = expenceController;
  
  module.exports = expenceController;

module.exports = expenceController;
