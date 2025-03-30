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

// Function to generate AO's report that shows all schools
export const generateAOFinancialReportPDF = async (financialYear, availableSchools) => {
  try {
    if (!financialYear) throw new Error("Financial year not provided");
    if (!availableSchools || !Array.isArray(availableSchools) || availableSchools.length === 0) {
      throw new Error("No schools data available");
    }

    // Get all school details and their expense data
    const schoolsData = await fetchAllSchoolsData(financialYear, availableSchools);

    const styles = StyleSheet.create({
      page: {
        padding: 30,
        fontSize: 10,
        fontFamily: "Helvetica",
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
      },
      logo: {
        width: 80,
        height: 80,
        marginRight: 15,
      },
      headerContent: {
        flex: 1,
        alignItems: "center",
      },
      headerText: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        textAlign: "center",
        marginBottom: 5,
      },
      yearText: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        textAlign: "center",
        marginBottom: 5,
      },
      subTitle: {
        fontSize: 14,
        fontFamily: "NotoSansDevanagari",
        textAlign: "center",
        marginBottom: 15,
        marginTop: 10,
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
      schoolCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        width: "20%",
        textAlign: "left",
      },
      expenseCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "Helvetica",
        fontSize: 10,
        width: "8%",
      },
      lastCell: {
        borderRightWidth: 0,
      },
      headerCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 9,
        width: "8%",
        minHeight: 40,
      },
      headerSchoolCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        textAlign: "center",
        fontFamily: "NotoSansDevanagari",
        fontSize: 10,
        width: "20%",
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
    });

    // Define expense categories
    const categories = [
      { id: 1, name: "शैक्षणिक\nबाबी" },
      { id: 2, name: "पाणी स्वच्छता इ.\nबाबी" },
      { id: 3, name: "सुरक्षिता" },
      { id: 4, name: "किचन अन्न व\nपोषण" },
      { id: 5, name: "आरोग्य\nतपासण्या" },
      { id: 6, name: "आजारपण व\nअपघात" },
      { id: 7, name: "क्रीडा व\nकला" },
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
              <Text style={styles.subTitle}>वर्षभरात खालील बाबींवर झालेला खर्च</Text>
            </View>
          </View>

          {schoolsData.length > 0 ? (
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.headerSchoolCell}>
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
                    {index + 1}) {school.school_name || "N/A"}
                  </Text>
                  
                  {categories.map((category) => {
                    const expenseItem = school.expenses.find(exp => exp.head_id === category.id);
                    const amount = expenseItem ? expenseItem.actual_cost : 0;
                    
                    return (
                      <Text key={category.id} style={styles.expenseCell}>
                        {amount > 0 ? amount.toLocaleString("en-IN") : "0"}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>
              No financial data available for {financialYear}
            </Text>
          )}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      </Document>
    );

    return await pdf(MyDocument).toBlob();
  } catch (error) {
    console.error(
      "AO PDF Generation Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Function to fetch all schools' data and expenses
async function fetchAllSchoolsData(financialYear, availableSchools) {
  try {
    // Extract school IDs from available schools
    const schoolIds = availableSchools.map(record => {
      const parts = record.fund_report_record.split('|');
      return parts[1]; // Extract the school ID part
    });

    // Fetch all school details
    const schoolsResponse = await axios.get("/api/all-schools");
    let schools = schoolsResponse.data || [];
    
    // Filter schools based on available report records
    schools = schools.filter(school => schoolIds.includes(String(school.school_id)));

    // Fetch expense data for each school
    const schoolsWithExpenses = await Promise.all(
      schools.map(async (school) => {
        try {
          const expensesResponse = await axios.post("/api/yearlyExpenseData", {
            financialYear,
            school_id: school.school_id,
          });
          
          return {
            ...school,
            expenses: expensesResponse.data.data || [],
          };
        } catch (error) {
          console.error(`Error fetching expenses for school ${school.school_id}:`, error);
          return { ...school, expenses: [] };
        }
      })
    );

    return schoolsWithExpenses;
  } catch (error) {
    console.error("Error fetching schools data:", error);
    throw error;
  }
}