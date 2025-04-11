"use client";

import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Image, Plus, SquareCheckBig } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";

export default function Remarks() {
  const { t } = useTranslation();
  const location = useLocation();
  
  if (!location.state) {
    // Redirect back if state is missing
    const tharavId = params.index || localStorage.getItem("currentTharavId");
    navigate(`/home/meetings/tharav/${tharavId}`);
    return null;
  }

  // Then destructure with fallbacks
  const {
    tharavNo = "N/A",
    date = "N/A",
    purpose = "N/A",
    expectedAmount = "0",
    decisionTaken = "N/A",
    photo = null,
    meetingNumber,
    meetingId,
    schoolId = localStorage.getItem("school_id"),
    userId = localStorage.getItem("user_id"),
    headId = "N/A",
    nirnay_id,
  } = location.state || {};

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewImageModalOpen, setIsViewImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [remarkDate, setRemarkDate] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [actualExpense, setActualExpense] = useState("");
  const [remarkPhoto, setRemarkPhoto] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRemark, setEditingRemark] = useState(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [finalRemark, setFinalRemark] = useState("");
  const [finalRemarkPhoto, setFinalRemarkPhoto] = useState(null);
  const [isTharavCompleted, setIsTharavCompleted] = useState(false);
  const [completedTharavData, setCompletedTharavData] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Memoized remark parser
  const parseRemarks = useCallback((data) => {
    if (!data) return [];

    const dataArray = Array.isArray(data) ? data : data.data || [];

    return dataArray.map((remark) => {
      if (remark.parsedData) {
        return {
          id: remark.nirnay_remarks_id,
          date: remark.previous_date || new Date().toISOString(),
          text: remark.parsedData.remarkText || t("noRemark"),
          amount: remark.parsedData.actualExpense || "0",
          photo: remark.parsedData.remarkPhoto || null,
        };
      }

      const parts = remark.nirnay_remarks_record?.split("|") || [];
      return {
        id: remark.nirnay_remarks_id,
        date: remark.previous_date || new Date().toISOString(),
        text: parts[4]?.trim() || t("noRemark"),
        amount: parts[6]?.trim() || "0",
        photo: parts[5]?.trim() || null,
      };
    });
  }, [t]);

  // Check tharav completion status
  const checkTharavCompletion = useCallback(async (tharavId) => {
    if (!tharavId) {
      console.error(t("noTharavId"));
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/tharav/status/${tharavId}`
      );

      if (response.data) {
        let completedData = response.data.completedData;
        if (Array.isArray(completedData)) {
          completedData = completedData[0] || null;
        }

        const isCompleted =
          response.data.isCompleted ||
          (completedData && completedData.work_status === "Completed");

        setIsTharavCompleted(isCompleted);
        setCompletedTharavData(completedData || null);

        localStorage.setItem(
          `tharavCompleted_${tharavId}`,
          isCompleted ? "true" : "false"
        );
      } else {
        console.error(t("invalidResponseFormat"), response.data);
        setIsTharavCompleted(false);
        setCompletedTharavData(null);
      }
    } catch (err) {
      console.error(t("errorCheckingCompletion"), err);
      setIsTharavCompleted(false);
      setCompletedTharavData(null);
    }
  }, [t]);




  // Fetch remarks with error handling
  const fetchRemarks = useCallback(
    async (tharavId) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!tharavId) {
          console.error(t("noTharavIdForRemarks"));
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/remarks`, {
          params: {
            nirnay_id: tharavId,
          },
        });

        setRemarks(parseRemarks(response.data));
      } catch (err) {
        console.error(t("failedToFetchRemarks"), err);
        setError(t("failedToLoadRemarks"));
        setRemarks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [parseRemarks, t]
  );

  // Initial data loading
  useEffect(() => {
    if (nirnay_id) {
      localStorage.setItem("currentTharavId", nirnay_id);
      localStorage.setItem(
        `tharavCompleted_${nirnay_id}`,
        isTharavCompleted ? "true" : "false"
      );
    }

    const tharavIdToUse = nirnay_id || localStorage.getItem("currentTharavId");

    if (tharavIdToUse) {
      const storedStatus = localStorage.getItem(
        `tharavCompleted_${tharavIdToUse}`
      );
      if (storedStatus === "true") {
        setIsTharavCompleted(true);
      }

      checkTharavCompletion(tharavIdToUse);
      fetchRemarks(tharavIdToUse);
    }
  }, [nirnay_id, checkTharavCompletion, fetchRemarks]);

  // Submit new remark
  const handleAddRemark = async (e) => {
    e.preventDefault();

    if (!remarkText || !actualExpense) {
      Swal.fire(t("error"), t("requiredFields"), "error");
      return;
    }

    const confirmResult = await Swal.fire({
      title: t("areYouSure"),
      text: t("confirmAddRemark"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesAddIt"),
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("remarkText", remarkText);
      formData.append("actualExpense", actualExpense);
      formData.append("remarkDate", remarkDate || new Date().toISOString());
      formData.append("nirnay_id", nirnay_id);
      formData.append("schoolId", schoolId);
      formData.append("userId", userId);
      formData.append("headId", headId);
      if (remarkPhoto) formData.append("remarkPhoto", remarkPhoto);

      await axios.post("http://localhost:5000/api/remarks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchRemarks(nirnay_id || localStorage.getItem("currentTharavId"));
      setRemarkDate("");
      setRemarkText("");
      setActualExpense("");
      setRemarkPhoto(null);
      setIsAddRemarkModalOpen(false);

      Swal.fire(t("success"), t("remarkAddedSuccess"), "success");
    } catch (err) {
      console.error(t("failedToAddRemark"), err);
      Swal.fire(
        t("error"),
        err.response?.data?.message || t("failedToAddRemark"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Edit remark handler
  const handleEditRemark = (remark) => {
    setEditingRemark(remark);
    setRemarkText(remark.text);
    setActualExpense(remark.amount);
    setRemarkDate(remark.date);
    setIsEditModalOpen(true);
  };

  // Submit edited remark
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!remarkText || !actualExpense) {
      Swal.fire(t("error"), t("requiredFields"), "error");
      return;
    }

    const confirmResult = await Swal.fire({
      title: t("areYouSure"),
      text: t("confirmUpdateRemark"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesUpdateIt"),
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    const formData = new FormData();
    formData.append("remarkText", remarkText);
    formData.append("actualExpense", actualExpense);
    formData.append("remarkDate", remarkDate);
    formData.append("schoolId", schoolId);
    formData.append("userId", userId);
    if (remarkPhoto) formData.append("remarkPhoto", remarkPhoto);

    try {
      setIsLoading(true);
      await axios.put(
        `http://localhost:5000/api/remarks/${editingRemark.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchRemarks(nirnay_id || localStorage.getItem("currentTharavId"));
      setIsEditModalOpen(false);
      setEditingRemark(null);
      setRemarkPhoto(null);

      Swal.fire(t("success"), t("remarkUpdatedSuccess"), "success");
    } catch (err) {
      console.error(t("failedToUpdateRemark"), err);
      Swal.fire(
        t("error"),
        err.response?.data?.message || t("failedToUpdateRemark"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTharav = async (e) => {
    e.preventDefault();

    const tharavIdToUse = nirnay_id || localStorage.getItem("currentTharavId");

    if (!tharavIdToUse) {
      Swal.fire(t("error"), t("tharavIdNotFound"), "error");
      return;
    }

    if (!finalRemark) {
      Swal.fire(t("error"), t("finalRemarkRequired"), "error");
      return;
    }

    const confirmResult = await Swal.fire({
      title: t("areYouSure"),
      text: t("confirmCompleteTharav"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesCompleteIt"),
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("nirnay_id", tharavIdToUse);
      formData.append("completed_remarks", finalRemark);
      formData.append("schoolId", schoolId || localStorage.getItem("schoolId"));
      formData.append("userId", userId || localStorage.getItem("userId"));

      if (finalRemarkPhoto) {
        formData.append("complete_tharav_img", finalRemarkPhoto);
      }

      const response = await axios.post(
        "http://localhost:5000/api/tharav/complete",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        localStorage.setItem(`tharavCompleted_${tharavIdToUse}`, "true");

        setIsTharavCompleted(true);
        setCompletedTharavData(response.data.completedData);

        Swal.fire(t("success"), t("tharavCompletedSuccess"), "success");
        setIsCompleteModalOpen(false);
      }
    } catch (err) {
      console.error(t("failedToCompleteTharav"), err);
      Swal.fire(
        t("error"),
        err.response?.data?.message || t("failedToCompleteTharav"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete remark handler
  const handleDeleteRemark = async (id) => {
    const result = await Swal.fire({
      title: t("areYouSure"),
      text: t("confirmDeleteRemark"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesDeleteIt"),
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/remarks/${id}`);
        await fetchRemarks(
          nirnay_id || localStorage.getItem("currentTharavId")
        );

        Swal.fire(t("deleted"), t("remarkDeletedSuccess"), "success");
      } catch (err) {
        console.error(t("failedToDeleteRemark"), err);
        Swal.fire(
          t("error"),
          err.response?.data?.message || t("failedToDeleteRemark"),
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // View image handler
  const handleViewImage = (imagePath) => {
    setSelectedImage(`http://localhost:5000/${imagePath}`);
    setIsViewImageModalOpen(true);
  };

  // Helper functions
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return t("invalidDate");
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="container mx-auto px-4 py-8 realfont w-[1200px]">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Remarks Section */}
        <div className="shadow-lg rounded-[14px] overflow-hidden">
          <div className="bg-blue-950 text-white p-3 md:p-4 flex flex-col gap-4">
            <div className="bg-blue-950 rounded-xl p-4 mb-6">
              <h1 className="text-3xl font-bold text-white mb-3">
                {t("tharavNo")} {tharavNo}
              </h1>

              <div className="flex  gap-[200px] ">
                {/* Date */}
                <div className="col-span-1">
                  <label className="block text-s font-semibold text-neutral-400">
                    {t("date")}
                  </label>
                  <p className="text-m text-white font-medium">
                    {formatDate(date)}
                  </p>
                </div>

                <div className="col-span-1">
                  <label className="block text-s font-semibold text-neutral-400">
                    {t("expectedAmount")}
                  </label>
                  <p className="text-m text-white font-medium">
                    {formatCurrency(expectedAmount)}
                  </p>
                </div>

                <div className="col-span-2 md:col-span-4">
                  <label className="block text-s font-semibold text-neutral-400">
                    {t("purpose")}
                  </label>
                  <p className="text-m text-white font-medium">
                    {purpose || t("na")}
                  </p>
                </div>

                <div className="col-span-2 md:col-span-4">
                  <label className="block text-s font-semibold text-neutral-400">
                    {t("decisionTaken")}
                  </label>
                  <p className="text-m text-white font-medium">
                    {decisionTaken || t("na")}
                  </p>
                </div>
              </div>

              {/* Buttons - now in a compact row */}
              <div className="mt-[30px] flex flex-wrap gap-2 ml-[400px] -mb-[39px]">
                {!isTharavCompleted && (
                  <button
                    onClick={() => setIsCompleteModalOpen(true)}
                    className="bg-green-600 font-bold h-[50px] text-white px-3 py-1 text-lg cursor-pointer rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <CheckCircle size={14} />
                    {t("completeTharav")}
                  </button>
                )}
                {photo && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-500 text-white w-[150px] px-3 py-1 text-lg cursor-pointer rounded-lg hover:bg-blue-600 flex items-center gap-1"
                  >
                    <Image size={22} />
                    {t("viewPhoto")}
                  </button>
                )}
              </div>

              {/* Completion Card */}
              {isTharavCompleted && (
                <div className="mt-[65px] rounded-md border border-green-300 bg-green-100 p-3 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded font-medium text-s">
                    {completedTharavData?.complete_date &&
                      new Date(
                        completedTharavData.complete_date
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>

                  <div className="text-center mt-4">
                    <h2 className="text-lg font-bold text-green-800">
                      {t("tharavCompleted")}
                    </h2>
                  </div>

                  <div className="flex mt-4 items-start justify-between flex-wrap gap-3">
                    <p className="text-sm text-green-800 font-medium">
                      {t("finalRemark")}:{" "}
                      <span className="text-black">
                        {completedTharavData?.completed_remarks ||
                          t("noFinalRemark")}
                      </span>
                    </p>
                    {completedTharavData?.complete_tharav_img && (
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <Image className="w-6 h-6 text-white" />
                        </button>
                        <span className="mt-1 text-sm font-medium">{t("photo")}</span>
                      </div>
                    )}
                  </div>

                  {/* Image Modal */}
                  {showImageModal && (
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50"
                      onClick={() => setShowImageModal(false)}
                    >
                      <div className="relative max-w-3xl max-h-[90vh]">
                        <button
                          className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageModal(false);
                          }}
                        >
                          &times;
                        </button>
                        <img
                          src={`http://localhost:5000${completedTharavData.complete_tharav_img}`}
                          alt={t("completedTharav")}
                          className="max-w-full max-h-[80vh] object-contain"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Remarks Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold realfont2 flex items-center gap-2">
                <SquareCheckBig size={18} />
                {t("remarks")}
              </h2>
              {!isTharavCompleted ? (
                <button
                  onClick={() => setIsAddRemarkModalOpen(true)}
                  className="realfont2 bg-white text-blue-950 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors shadow-md"
                  disabled={isLoading}
                >
                  <Plus size={18} />
                  {isLoading ? t("processing") : t("addRemark")}
                </button>
              ) : (
                <span className="text-gray-500 text-sm"> </span>
              )}
            </div>
          </div>

          {isLoading && !remarks.length ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              <p>{t("loadingRemarks")}</p>
            </div>
          ) : remarks.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable
                columns={[
                  {
                    name: t("date"),
                    selector: (row) => row.date,
                    sortable: true,
                    minWidth: "120px",
                    cell: (row) => (
                      <div className="py-2">{formatDate(row.date)}</div>
                    ),
                  },
                  {
                    name: t("remarks"),
                    selector: (row) => row.text,
                    sortable: true,
                    minWidth: "200px",
                    wrap: true,
                    cell: (row) => (
                      <div
                        className="py-2 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]"
                        title={row.text}
                      >
                        {row.text}
                      </div>
                    ),
                  },
                  {
                    name: t("actualExpense"),
                    selector: (row) => row.amount,
                    sortable: true,
                    minWidth: "120px",
                    cell: (row) => (
                      <div className="py-2">{formatCurrency(row.amount)}</div>
                    ),
                  },
                  {
                    name: t("photo"),
                    selector: (row) => row.photo,
                    sortable: false,
                    minWidth: "100px",
                    cell: (row) => (
                      <div className="py-2">
                        {row.photo ? (
                          <button
                            onClick={() => handleViewImage(row.photo)}
                            className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            {t("view")}
                          </button>
                        ) : (
                          <span className="text-gray-400">{t("noPhoto")}</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    name: t("actions"),
                    sortable: false,
                    minWidth: "140px",
                    cell: (row) => (
                      <div className="py-2 flex gap-2">
                        {!isTharavCompleted ? (
                          <>
                            <button
                              onClick={() => handleEditRemark(row)}
                              className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              {t("edit")}
                            </button>
                            <button
                              onClick={() => handleDeleteRemark(row.id)}
                              className="text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                            >
                              {t("delete")}
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {t("tharavIsCompleted")}
                          </span>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={remarks}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30]}
                highlightOnHover
                responsive
                defaultSortFieldId={0}
                progressPending={isLoading}
                customStyles={{
                  headCells: {
                    style: {
                      backgroundColor: "#f3f4f6",
                      fontSize: "16px",
                      fontWeight: "600",
                      justifyContent: "center",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                    },
                  },
                  cells: {
                    style: {
                      fontSize: "14px",
                      color: "#333",
                      justifyContent: "center",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      fontFamily: "Poppins",
                      fontWeight: "400",
                    },
                  },
                  pagination: {
                    style: {
                      fontSize: "13px",
                      minHeight: "56px",
                      borderTopStyle: "solid",
                      borderTopWidth: "1px",
                      borderTopColor: "#f3f4f6",
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-gray-500">
                {error ? t("errorLoadingRemarks") : t("noRemarksAdded")}
              </div>
            </div>
          )}
        </div>

      {/* Tharav Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">{t("tharavPhoto")}</h3>
            <img
              src={photo || "/placeholder.svg"}
              alt={t("fullTharavPhoto")}
              className="w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Remark Image Modal */}
      {isViewImageModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => {
                setIsViewImageModalOpen(false);
                setSelectedImage(null);
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">{t("remarkPhoto")}</h3>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt={t("remark")}
              className="w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {isCompleteModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4 ">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full shadow-md">
            <button
              onClick={() => setIsCompleteModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
            <h2 className="text-2xl text-blue-950 mb-6">{t("completeTharav")}</h2>
            <form onSubmit={handleCompleteTharav}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("finalRemark")}
                </label>
                <textarea
                  value={finalRemark}
                  onChange={(e) => setFinalRemark(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("uploadPhoto")}
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFinalRemarkPhoto(e.target.files?.[0] || null)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? t("submitting") : t("markAsCompleted")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Remark Modal */}
      {isAddRemarkModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <button
              onClick={() => setIsAddRemarkModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-950 mb-6">
              {t("addRemark")}
            </h2>
            <form onSubmit={handleAddRemark}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("date")}
                </label>
                <input
                  type="date"
                  value={remarkDate}
                  onChange={(e) => setRemarkDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("remarks")}
                </label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("actualExpense")} (₹)
                </label>
                <input
                  type="number"
                  value={actualExpense}
                  onChange={(e) => setActualExpense(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("uploadPhoto")}
                </label>
                <input
                  type="file"
                  onChange={(e) => setRemarkPhoto(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*"
                />
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRemarkModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? t("submitting") : t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Remark Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRemark(null);
                setRemarkPhoto(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-950 mb-6">
              {t("editRemark")}
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("date")}
                </label>
                <input
                  type="date"
                  value={remarkDate}
                  onChange={(e) => setRemarkDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("remarks")}
                </label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("actualExpense")} (₹)
                </label>
                <input
                  type="number"
                  value={actualExpense}
                  onChange={(e) => setActualExpense(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("uploadNewPhotoOptional")}
                </label>
                <input
                  type="file"
                  onChange={(e) => setRemarkPhoto(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*"
                />
                {editingRemark?.photo && !remarkPhoto && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{t("currentPhoto")}:</p>
                    <img
                      src={`http://localhost:5000/${editingRemark.photo}`}
                      alt={t("currentRemarkProof")}
                      className="mt-1 max-h-32 rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRemark(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? t("updating") : t("update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}