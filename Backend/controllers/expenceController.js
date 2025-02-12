// controllers/smcController.js
const expenceModel = require('../models/expenceModel');

const expenceController = {
    async getData(req, res) {
        try {
            const { month, year, category_id, school_id } = req.body;


            


            const heads = await expenceModel.getActiveHeads();
            const niryan = await expenceModel.getActiveNiryan();
            const niryanRemarks = await expenceModel.getActiveNiryanRemarks();

            const response = heads.map(head => {
                const headId = head.head_id;

                // Filter Niryan
                const filteredNiryan = niryan.filter(n => {
                    const parts = n.nirnay_reord.split('|');
                    if (parts.length >= 12) {
                        const date = new Date(parts[8]);
                        const formattedMonth = date.getMonth() + 1; // Months are 0-indexed
                        const formattedYear = date.getFullYear();

                        return (
                            parts[11] === headId &&
                            formattedMonth === parseInt(month) &&
                            formattedYear === parseInt(year) &&
                            (category_id === '4' ? parts[5] === school_id : true)
                        );
                    }
                    return false;
                });

                const filteredNiryanSum = filteredNiryan.reduce((sum, n) => {
                    const amount = Number(n.nirnay_reord.split('|')[3]) || 0;
                    return sum + amount;
                }, 0);

                // Filter Niryan Remarks
                const filteredNiryanRemarks = niryanRemarks.filter(nr => {
                    const parts = nr.nirnay_remarks_record.split('|');
                    if (parts.length >= 9) {
                        const date = new Date(parts[8]);
                        const formattedMonth = date.getMonth() + 1; // Months are 0-indexed
                        const formattedYear = date.getFullYear();

                        return (
                            parts[7] === headId &&
                            formattedMonth === parseInt(month) &&
                            formattedYear === parseInt(year) &&
                            (category_id === '4' ? parts[2] === school_id : true)
                        );
                    }
                    return false;
                });

                const filteredNiryanRemarksSum = filteredNiryanRemarks.reduce((sum, nr) => {
                    const amount = Number(nr.nirnay_remarks_record.split('|')[6]) || 0;
                    return sum + amount;
                }, 0);

                head.andajit_kharch = filteredNiryanSum;
                head.prateksh_kelela_kharch = filteredNiryanRemarksSum;

                return head;
            });

            res.status(200).json({
                success: true,
                data: response,
                message: 'Data fetched successfully'
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = expenceController;
