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

export const generateAOFinancialReportPDF = async (financialYear) => {
  try {
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
        marginBottom: 25,
        paddingBottom: 12,
        borderBottomWidth: 1.5,
        borderBottomColor: "#333",
      },
      logo: {
        width: 85,
        height: 85,
        marginRight: 20,
      },
      headerText: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "NotoSansDevanagari",
        textAlign: "center",
        marginBottom: 6,
        color: "#1a1a1a",
      },
      yearText: {
        fontSize: 18,
        fontFamily: "NotoSansDevanagari",
        textAlign: "center",
        marginBottom: 6,
        color: "#333",
      },
      subTitle: {
        fontSize: 14,
        fontFamily: "NotoSansDevanagari",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 12,
        color: "#444",
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
        fontSize: 10,
        width: "20%",
        textAlign: "left",
        lineHeight: 1.2,
        fontSize:22
      },
      expenseCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        width: "8.88%",
      },
      headerCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 8,
        width: "8.88%",
        minHeight: 40,
      },
      totalRow: {
        backgroundColor: "#f9f9f9",
        flexDirection: "row",
        padding: 8,
        width: "100%",
        marginTop: 10,
      },
      totalLabel: {
        fontWeight: "bold",
        textAlign: "right",
        fontFamily: "NotoSansDevanagari",
        fontSize: 12,
        flex: 1,
        color: "#222",
      },
      totalAmount: {
        fontFamily: "NotoSansDevanagari",
        fontSize: 12,
        textAlign: "left",
        color: "#222",
      },
      rupeeSymbol: {
        fontFamily: "NotoSansDevanagari",
        fontSize: 14,
        textAlign: "left",
        marginRight: 5,
        color: "#222",
      },
      pageNumber: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 8,
        fontFamily: "NotoSansDevanagari",
        color: "#666",
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
            <View>
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
                  <Text style={[styles.schoolCell, { textAlign: "center" }]}>
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
              `पृष्ठ ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      </Document>
    );

    return await pdf(MyDocument).toBlob();
  } catch (error) {
    throw error;
  }
};

// fetchAllSchoolsData function remains unchanged
async function fetchAllSchoolsData(financialYear, fundReports) {
  try {
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
        } catch (error) {
          return { ...school, expenses: [] };
        }
      })
    );

    return schoolsWithExpenses;
  } catch (error) {
    throw error;
  }
}