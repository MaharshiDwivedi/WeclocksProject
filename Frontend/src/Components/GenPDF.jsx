import axios from "axios";
import NotoSansDevanagari from "../Fonts/NotoSansDevanagari-Regular.ttf";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Font,
  Image,
} from "@react-pdf/renderer";
import logo from "../assets/logo.jpeg";

// Register font
Font.register({
  family: "NotoSansDevanagari",
  src: NotoSansDevanagari,
});

axios.defaults.baseURL = "http://localhost:5000";

export const generateFinancialReportPDF = async (financialYear) => {
  try {
    const schoolId = localStorage.getItem("school_id");
    if (!schoolId) throw new Error("School ID not found in localStorage");

    // Pass the full financial year format to the API
    const [yearStart, yearEnd] = financialYear.split("-");

    // Fetch school and yearly data
    const [schoolRes, yearlyRes] = await Promise.all([
      axios
        .get("/api/schools-with-smc", { params: { id: schoolId } })
        .catch((err) => {
          console.error("School API error:", err);
          return { data: [] };
        }),
      axios
        .post("/api/yearlyExpenseData", {
          financialYear, // Send the full financial year format
          school_id: schoolId,
        })
        .catch((err) => {
          console.error("Yearly expense API error:", err);
          return { data: { data: [] } };
        }),
    ]);

    // Validate school response
    const schoolData = Array.isArray(schoolRes.data)
      ? schoolRes.data.find(
          (school) => String(school.school_id) === String(schoolId)
        )
      : null;

    const schoolName = schoolData?.school_name || "Unknown School";

    if (!schoolData) {
      console.warn("No school data found for ID:", schoolId);
    }

    const headData = yearlyRes.data.data || [];
    const totalExpense = yearlyRes.data.total_expense || 0;

    const styles = StyleSheet.create({
      page: {
        padding: 30,
        fontSize: 10,
        fontFamily: "Helvetica",
      },
      header: {
        flexDirection: "row", // Logo aur text ek row me
        alignItems: "center", // Vertically center
        justifyContent: "center", // Horizontally center
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
      },
      headerRow: {
        flexDirection: "row", // Logo and text in the same row
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
        gap: 20, // Add space between logo and text
      },
      headerCenter: {
        alignItems: "center", // Center logo and text horizontally
        textAlign: "center",
      },
      logo: {
        width: 80,
        height: 80,
        marginRight: 15,
      },
      headerContent: {
        flex: 1,
        textAlign: "center",
      },
      headerText: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        textAlign: "center",
        marginBottom:1,
        marginLeft:20
      },
      headerText1: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        textAlign: "center",
      },
      yearText: {
        fontSize: 16,
        marginLeft:55,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        marginBottom:5
      },
      titleText: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "NotoSansDevanagari",
      },
      table: {
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#000",
        marginBottom: 15,
      },
      tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
      },
      tableHeader: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
      },
      headerCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 12,
        width: "70%",
      },
      headerCell1: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 12,
        width: "30%",
      },
      dataCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 11,
        width: "70%",
      },
      amountCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "Helvetica",
        fontSize: 11,
        width: "30%",
      },
      lastCell: {
        borderRightWidth: 0,
      },
      totalRow: {
        backgroundColor: "#f9f9f9",
      },
      totalLabel: {
        fontWeight: "bold",
        textAlign: "right",
        fontFamily: "NotoSansDevanagari",
        fontSize: 11,
        gap:2,
        flex:1
      },
      pageNumber: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 8,
        color: "#666",
      },
      noDataText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 12,
        color: "#666",
      },
      rupeeSymbol: {
        fontFamily: "NotoSansDevanagari",
        marginLeft:5
      },
    });

    const MyDocument = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.logo} src={logo} />
            <View>
              <Text style={styles.headerText}>ITDP - Nandurbar</Text>
              <Text style={styles.yearText}>{financialYear}</Text>
              <Text style={styles.headerText1}>Weclocks Technology</Text>
            </View>
          </View>

          {headData.length > 0 ? (
            <>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.headerCell}>
                    शीर्षक (Expenditure Head)
                  </Text>
                  <Text style={[styles.headerCell1, styles.lastCell]}>
                    रक्कम (Amount)
                  </Text>
                </View>

                {headData.map((head) => (
                  <View key={head.head_id} style={styles.tableRow}>
                    <Text style={styles.dataCell}>
                      {head.head_name || "N/A"}
                    </Text>
                    <Text style={[styles.amountCell, styles.lastCell]}>
                      <Text style={styles.rupeeSymbol}>₹ </Text>
                      {(head.actual_cost || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>
                  एकूण खर्च (Total Expense) : 
                </Text>
                <Text style={styles.rupeeSymbol}>  ₹ {totalExpense.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</Text>

                 
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>
              No financial data available for {financialYear}
            </Text>
          )}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </Page>
      </Document>
    );

    return await pdf(MyDocument).toBlob();
  } catch (error) {
    console.error(
      "PDF Generation Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const handlePDFGeneration = async (financialYear) => {
  try {
    const blob = await generateFinancialReportPDF(financialYear);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ITDP_Financial_Report_${financialYear.replace(
      /-/g,
      "_"
    )}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error(`Failed to generate PDF: ${error.message}`);
    throw error;
  }
};
