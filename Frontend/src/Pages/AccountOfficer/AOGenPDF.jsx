import axios from "axios";
import NotoSansDevanagari from "../../Fonts/NotoSansDevanagari-Regular.ttf";
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
import logo from "../../assets/logo.jpeg";

// Register font
Font.register({
  family: "NotoSansDevanagari",
  src: NotoSansDevanagari,
});

axios.defaults.baseURL = "http://localhost:5000";

export const generateAOFinancialReportPDF = async (financialYear) => {
    if (!financialYear) {
      throw new Error("Financial year not provided");
    }

    const fundReportsResponse = await axios.post(`/api/fundreports`, {
      year: financialYear,
    });

    if (!fundReportsResponse?.data?.data?.length) {
      throw new Error(`No fund reports available for ${financialYear}`);
    }

    const schoolsData = await fetchAllSchoolsData(
      financialYear,
      fundReportsResponse.data.data
    );

    const totalExpense = schoolsData.reduce((sum, school) => {
      const schoolTotal = school.expenses.reduce(
        (acc, exp) => acc + (exp.actual_cost || 0),
        0
      );
      return sum + schoolTotal;
    }, 0);

    const styles = StyleSheet.create({
      page: {
        padding: 35,
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
      },
      logo: {
        width: 80,
        height: 80,
        marginRight: 10,
        objectFit: "contain",
      },
      headerContent: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      headerText: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        textAlign: "center",
        marginBottom: 4,
        color: "#1a1a1a",
      },
      yearText: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        marginBottom: 9,
      },
      subTitle: {
        fontSize: 15  ,
        fontFamily: "NotoSansDevanagari",
        textAlign: "center",
        color: "#444",
        lineHeight: 1.2,
      },
      table: {
        display: "table",
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
        width: "100%",
      },
      tableHeader: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
      },
      schoolCell: {
        padding: 5,
        fontFamily: "NotoSansDevanagari",
        borderRightWidth: 1,
        borderRightColor: "#000",
        fontSize: 11,
        width: "20%",
        textAlign: "center",
        lineHeight: 1.4,
      },
      schoolCell1: {
        fontFamily: "NotoSansDevanagari",
        borderRightWidth: 1,
        borderRightColor: "#000",
        fontSize: 13,
        width: "20%",
        textAlign: "center",
        fontWeight:500,
        padding: 10,
      },
      expenseCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        width: "8.88%",
        lineHeight: 1.2,
      },
      headerCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 12,
        width: "8.88%",
        minHeight: 40,
        lineHeight: 1.2,
        fontWeight:500,
      },
      totalRow: {
        flexDirection: "row",
        padding: 8,
        width: "100%",
        marginTop: 10,
        fontWeight:500,
      },
      totalLabel: {
        fontWeight: "bold",
        textAlign: "right",
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        flex: 1,
        color: "#000",
      },
      totalAmount: {
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        textAlign: "left",
        color: "#000",
        fontWeight:500,
      },
      rupeeSymbol: {
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        textAlign: "left",
        marginLeft: 5,
        color: "#000",
        fontWeight:500,
      },
      pageNumber: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 8,
        fontFamily: "NotoSansDevanagari",
        color: "#111",
      },
      noDataText: {
        textAlign: "center",
        marginTop: 25,
        fontSize: 12,
        fontFamily: "NotoSansDevanagari",
        color: "#666",
      },
    });

    const categories = [
      { id: 1, name: "शैक्षणिक\nबाबी" },
      { id: 2, name: "पाणी स्वच्छता\nबाबी" },
      { id: 3, name: "सुरक्षिता" },
      { id: 4, name: "किचन अन्न\nव पोषण" },
      { id: 5, name: "आरोग्य\nतपासण्या" },
      { id: 6, name: "आजारपण\nव अपघात" },
      { id: 7, name: "क्रीडा\nव कला" },
      { id: 8, name: "शाळेचे\nशुशोभीकरण" },
      { id: 9, name: "अन्य\nखर्च" },
    ];

    const MyDocument = (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.logo} src={logo} />
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>ITDP - Nandurbar</Text>
              <Text style={styles.yearText}>{financialYear}</Text>
              <Text style={styles.subTitle}>
                वर्षभरात खालील बाबींवर झालेला खर्च
              </Text>
            </View>
          </View>

          {schoolsData.length > 0 ? (
            <>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.schoolCell1]}>
                    शाळा
                  </Text>
                  {categories.map((category) => (
                    <Text key={category.id} style={styles.headerCell}>
                      {category.name}
                    </Text>
                  ))}
                </View>
                {schoolsData.map((school, index) => (
                  <View key={school.school_id} style={styles.tableRow}>
                    <Text style={styles.schoolCell}>
                      {index + 1}){" "}
                      {school.school_name
                        ? school.school_name.trim()
                        : "नाव उपलब्ध नाही"}
                    </Text>
                    {categories.map((category) => {
                      const expense = school.expenses.find(
                        (e) => e.head_id === category.id
                      );
                      return (
                        <Text key={category.id} style={styles.expenseCell}>
                          {(expense?.actual_cost || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      );
                    })}
                  </View>
                ))}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  एकूण खर्च (Total Expense):  
                </Text>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <Text style={styles.totalAmount}>
                  {totalExpense.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
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
              ` ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      </Document>
    );

    return await pdf(MyDocument).toBlob();
};

// fetchAllSchoolsData function remains unchanged
async function fetchAllSchoolsData(financialYear, fundReports) {
    const reports = Array.isArray(fundReports) ? fundReports : [fundReports];

    const schoolIds = reports
      .map((report) => {
        const parts = report.fund_report_record?.split("|") || [];
        const isValid = parts.length === 2 && parts[0] === financialYear;
        return isValid ? parts[1] : null;
      })
      .filter(Boolean);

    if (!schoolIds.length) {
      throw new Error("No valid school records found in fund reports");
    }

    const schoolsResponse = await axios.get("/api/all-schools", {
      headers: {
        Accept: "application/json; charset=utf-8",
      },
    });
    const allSchools = schoolsResponse.data?.data || [];

    const filteredSchools = allSchools.filter((school) =>
      schoolIds.includes(String(school.school_id))
    );

    if (!filteredSchools.length) {
      throw new Error(
        "No active schools found matching fund report school IDs"
      );
    }

    const schoolsWithExpenses = await Promise.all(
      filteredSchools.map(async (school) => {
        try {
          const response = await axios.post(
            "/api/yearlyExpenseData",
            {
              financialYear,
              school_id: String(school.school_id),
            },
            {
              headers: {
                Accept: "application/json; charset=utf-8",
              },
            }
          );
          const expenses = response.data?.data || [];
          return {
            ...school,
            expenses,
          };
      } catch {
          return { ...school, expenses: [] };
        }
      })
    );

    return schoolsWithExpenses;
}