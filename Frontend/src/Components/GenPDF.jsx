import axios from "axios";
import NotoSansDevanagari from "../Fonts/NotoSansDevanagari-Regular.ttf";
import { Page, Text, View, Document, StyleSheet, pdf, Font, Image } from "@react-pdf/renderer";
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

    const year = financialYear.split("-")[0];

    // Fetch school and yearly data
    const [schoolRes, yearlyRes] = await Promise.all([
      axios.get("/api/schools-with-smc", { params: { id: schoolId } })
        .catch(err => {
          console.error("School API error:", err);
          return { data: [] };
        }),
      axios.post("/api/yearlyExpenseData", { year, school_id: schoolId })
        .catch(err => {
          console.error("Yearly expense API error:", err);
          return { data: { data: [] } };
        }),
    ]);

    // Validate school response
    const schoolData = Array.isArray(schoolRes.data) 
      ? schoolRes.data.find(school => String(school.school_id) === String(schoolId)) 
      : null;
    
    const schoolName = schoolData?.school_name || "Unknown School";
    
    if (!schoolData) {
      console.warn("No school data found for ID:", schoolId);
    }

    const headData = yearlyRes.data.data || [];

    const styles = StyleSheet.create({
      page: {
        padding: 20,
        fontSize: 9,
        fontFamily: "Helvetica",
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        paddingBottom: 8,
      },
      logo: {
        width: 70,
        height: 70,
        marginRight: 15,
      },
      headerContent: {
        flex: 1,
        textAlign: "center",
      },
      headerText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
      },
      yearText: {
        fontSize: 11,
        marginBottom: 4,
      },
      titleText: {
        fontSize: 14,
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
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 8,
        minWidth: 60,
        maxWidth: 100,
        flexWrap: "wrap",
        lineHeight: 1.2,
      },
      amountCell: {
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "Helvetica",
        fontSize: 8,
        minWidth: 60,
        maxWidth: 100,
      },
      lastCell: {
        borderRightWidth: 0,
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
    });

    const MyDocument = (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.logo} src={logo} />
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>ITDP - Nandurbar</Text>
              <Text style={styles.yearText}>{financialYear}</Text>
              <Text style={styles.titleText}>{schoolName}</Text>
            </View>
          </View>

          {headData.length > 0 ? (
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {headData.map((head, index) => (
                  <Text 
                    key={head.head_id} 
                    style={[
                      styles.headerCell,
                      index === headData.length - 1 && styles.lastCell
                    ]}
                  >
                    {head.head_name || "N/A"}
                  </Text>
                ))}
              </View>
              <View style={styles.tableRow}>
                {headData.map((head, index) => (
                  <Text 
                    key={head.head_id} 
                    style={[
                      styles.amountCell,
                      index === headData.length - 1 && styles.lastCell
                    ]}
                  >
                    {(head.actual_cost || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <Text>No financial data available for {financialYear}</Text>
          )}

          <Text 
            style={styles.pageNumber} 
            render={({ pageNumber, totalPages }) => 
              `${pageNumber} / ${totalPages}`} 
            fixed 
          />
        </Page>
      </Document>
    );

    return await pdf(MyDocument).toBlob();
  } catch (error) {
    console.error("PDF Generation Error:", error.response?.data || error.message);
    throw error;
  }
};

export const handlePDFGeneration = async (financialYear) => {
  try {
    const blob = await generateFinancialReportPDF(financialYear);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Financial_Report_${financialYear}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(`Failed to generate PDF: ${error.message}`);
    throw error;
  }
};